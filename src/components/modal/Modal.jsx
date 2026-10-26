import { useNavigate } from "react-router-dom";
import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState, useEffect } from 'react'
import { toast } from 'react-toastify';
import { Timestamp } from 'firebase/firestore';
import { orderService } from '../../services/order/orderService';
import { paymentService } from '../../services/payment/paymentService';
import { clearCart } from '../../redux/cartSlice';
import { useDispatch } from 'react-redux';
import useAuth from '../../hooks/auth/useAuth';

export default function Modal({ setGrandTotal, items, isOpen: externalIsOpen, closeModal: externalCloseModal, hideTriggerButton }) {
    const navigate = useNavigate();
    const { user, setIsLoginOpen } = useAuth();
    const [internalIsOpen, setInternalIsOpen] = useState(false);

    const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

    function closeModal() {
        if (externalCloseModal) {
            externalCloseModal();
        } else {
            setInternalIsOpen(false);
        }
    }

    function openModal() {
        if (externalIsOpen === undefined) {
            setInternalIsOpen(true);
        }
    }

    function handleClick() {
        if (!user) {
            setIsLoginOpen(true);
        } else {
            openModal();
        }
    }

    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [pincode, setPincode] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [paymentMode, setPaymentMode] = useState("");

    /************************************************** PAYMENT INTEGRATION **************************************************
     ******************************************************** RAZORPAY *******************************************************/
    const dispatch = useDispatch()

    const buyNow = async () => {
        try {
            // validation 
            const emptyFields = [];
            if (name === "") emptyFields.push("Name");
            if (address === "") emptyFields.push("Address");
            if (pincode === "") emptyFields.push("Pincode");
            if (phoneNumber === "") emptyFields.push("Phone Number");
            if (paymentMode === "") emptyFields.push("Payment Mode");
            if (emptyFields.length > 0) {
                toast.error(`Please provide value for: ${emptyFields.join(", ")}`, {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                });
                return;
            }

            const addressInfo = {
                name,
                address,
                pincode,
                phoneNumber
            }

            // store in firebase 
            const orderInfo = {
                items,
                addressInfo,
                date: Timestamp.now(),
                edDate: new Date(new Date().setDate(new Date().getDate() + 12)),
                email: user?.user?.email,
                userid: user?.user?.uid,
                status: 'Order Placed',
                totalAmount: Number(setGrandTotal),
                paymentMode: paymentMode,
                isCustom: false,
                paymentId: null
            }


            if (paymentMode === 'Online Payment') {
                let initiatedViaCloud = false;
                try {
                    const itemsPayload = (items || []).map(item => {
                        const vId = item.variantId ||
                            item.selectedVariantObj?.variantId ||
                            item.selectedVariantObj?.id ||
                            (item.selectedVariant ? (item.selectedVariant.variantId || item.selectedVariant.sku || item.selectedVariant.id || null) : null) ||
                            null;
                        const vOptions = item.selectedVariant || item.selectedVariantObj?.attributes || null;
                        return {
                            productId: item.id || item.productId || "unknown",
                            variantId: vId,
                            options: vOptions,
                            selectedVariant: vOptions,
                            quantity: item.quantity || 1
                        };
                    });

                    const shippingAddressPayload = {
                        fullName: name,
                        phone: phoneNumber,
                        pincode: pincode,
                        street: address,
                        houseNo: address,
                    };

                    const payOrder = await paymentService.createPaymentOrder({
                        items: itemsPayload,
                        couponCode: "",
                        shippingAddress: shippingAddressPayload
                    });

                    initiatedViaCloud = true;

                    await paymentService.openRazorpayCheckout({
                        paymentId: payOrder.paymentId,
                        gatewayOrderId: payOrder.gatewayOrderId,
                        amount: payOrder.amount,
                        currency: payOrder.currency,
                        keyId: payOrder.keyId,
                        userProfile: { name, phone: phoneNumber, email: user?.user?.email },
                        onSuccess: async (response) => {
                            try {
                                await paymentService.verifyPayment({
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_signature: response.razorpay_signature,
                                    orderId: payOrder.orderId,
                                });
                            } catch (vErr) {
                                console.warn("Client verify error:", vErr);
                            }
                            toast.success('Payment Received! Order placed successfully.');
                            dispatch(clearCart());
                            closeModal();
                            navigate('/profile?tab=orders');
                        },
                        onFailure: (errMsg) => {
                            toast.error(errMsg || 'Payment cancelled or failed.');
                        }
                    });
                } catch (payErr) {
                    console.error("Cloud Function payment error:", payErr);

                    if (initiatedViaCloud) {
                        // Razorpay popup was opened; user cancelled or failed. Do not bypass!
                        return;
                    }

                    // Client-Side Razorpay Gateway Fallback (Strictly opens Razorpay popup!)
                    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_SUKZpvg7nte0jc";
                    const calculatedAmount = Math.round(Number(setGrandTotal) * 100);

                    await paymentService.openRazorpayCheckout({
                        paymentId: "pay_client_" + Date.now(),
                        gatewayOrderId: "",
                        amount: calculatedAmount,
                        currency: "INR",
                        keyId: razorpayKey,
                        userProfile: { name, phone: phoneNumber, email: user?.user?.email },
                        onSuccess: async (response) => {
                            try {
                                orderInfo.paymentId = response.razorpay_payment_id || response.paymentId;
                                await orderService.createOrder(orderInfo);
                                toast.success('Payment Successful! Order Placed.');
                                dispatch(clearCart());
                                closeModal();
                                navigate('/order');
                            } catch (err) {
                                console.error("Error creating order:", err);
                                toast.error("Failed to record order.");
                            }
                        },
                        onFailure: (errMsg) => {
                            toast.error(errMsg || 'Payment cancelled or failed.');
                        }
                    });
                }
            } else {
                orderInfo.totalAmount += 40;
                orderInfo.isCod = true;
                orderInfo.paymentMode = 'Cash on Delivery';
                orderInfo.paymentMethod = 'COD';
                orderInfo.paymentStatus = 'PENDING';
                orderInfo.orderStatus = 'PLACED';
                orderInfo.status = 'Order Placed';
                orderInfo.payment = {
                    paymentId: 'cod_' + Date.now(),
                    gateway: 'COD',
                    gatewayOrderId: '',
                    gatewayPaymentId: '',
                    method: 'COD',
                    status: 'PENDING',
                };
                orderInfo.paymentInfo = {
                    method: 'COD',
                    gateway: 'COD',
                    status: 'PENDING',
                };

                await orderService.createOrder(orderInfo);
                toast.success('Order Placed Successfully');
                dispatch(clearCart());
                closeModal();
                navigate('/order');
            }
        } catch (error) {
            console.log(error);
            closeModal();
        }
    }





    return (
        <>
            {!hideTriggerButton && (
                <div className="text-center rounded-lg text-black font-bold">
                    <button
                        type="button"
                        onClick={handleClick}
                        className="w-full bg-black hover:bg-violet-700 py-2 text-center rounded-lg text-white font-bold"
                    >
                        Buy Now
                    </button>
                </div>
            )}

            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl p-2  text-left align-middle shadow-xl transition-all bg-gray-50">

                                    <section className="">
                                        <div className="flex flex-col items-center justify-center py-8 mx-auto  lg:py-0">
                                            {/* <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                                                <img className="w-8 h-8 mr-2" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg" alt="logo" />
                                                Flowbite
                                            </a> */}
                                            <div className="w-full  rounded-lg md:mt-0 sm:max-w-md xl:p-0 ">
                                                <div className="p-6 space-y-4 md:space-y-6 sm:p-8">

                                                    <form className="space-y-4 md:space-y-6" action="#">
                                                        <div>
                                                            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">Enter Full Name</label>
                                                            <input value={name} onChange={(e) => setName(e.target.value)} type="name" name="name" id="name" className=" border outline-0 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 bg-gray-100" required />
                                                        </div>
                                                        <div>
                                                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">Enter Full Address</label>
                                                            <input value={address} onChange={(e) => setAddress(e.target.value)} type="text" name="address" id="address" className=" border outline-0 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 bg-gray-100" required />
                                                        </div>
                                                        <div>
                                                            <label htmlFor="pincode" className="block mb-2 text-sm font-medium text-gray-900">Enter Pincode</label>
                                                            <input value={pincode} onChange={(e) => setPincode(e.target.value)} type="text" name="pincode" id="pincode" className=" border outline-0 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 bg-gray-100" required />
                                                        </div>
                                                        <div>
                                                            <label htmlFor="mobileNumber" className="block mb-2 text-sm font-medium text-gray-900">Enter Mobile Number</label>
                                                            <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} type="text" name="mobileNumber" id="mobileNumber" className=" border outline-0 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 bg-gray-100" required />
                                                        </div>

                                                        <div>
                                                            <label htmlFor="paymentmode" className="block mb-2 text-sm font-medium text-gray-900">Payment Mode</label>
                                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <input
                                                                    name="paymentMethod"
                                                                    type="radio"
                                                                    value="COD"
                                                                    onChange={() => { setPaymentMode('COD'); }}
                                                                />
                                                                Cash on Delivery(COD)
                                                                <div className="pl-2"></div>
                                                                <input                                                                   
                                                                    name="paymentMethod"
                                                                    type="radio"
                                                                    value="Online Payment"
                                                                    onChange={() => { setPaymentMode('Online Payment'); }}
                                                                />
                                                                Online Payment
                                                            </label>
                                                            <label className="text-xs">
                                                                <span className="text-red-500">Note:</span> For COD, an additional fee of ₹40 will be applied
                                                            </label>

                                                        </div>

                                                    </form>
                                                    <button onClick={() => { buyNow(); }} type="button" className="focus:outline-none w-full text-white bg-black hover:bg-violet-800  outline-0 font-medium rounded-lg text-sm px-5 py-2.5 ">Order Now</button>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}