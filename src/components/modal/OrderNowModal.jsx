import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react'
import { toast } from 'react-toastify';
import { Timestamp } from 'firebase/firestore';
import { orderService } from '../../services/order/orderService';
import { uploadService } from '../../services/upload/uploadService';
import { paymentService } from '../../services/payment/paymentService';
import { deleteFromCart } from '../../redux/cartSlice';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../../components/loader/Loader'
import useAuth from '../../hooks/auth/useAuth';
import { getFriendlyErrorMessage } from '../../utils/firebaseErrorHandler.js';

function OrderNowModal() {
    const { user, setIsLoginOpen } = useAuth();
    let [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false);

    function closeModal() {
        setIsOpen(false)
    }

    function openModal() {
        setIsOpen(true)
    }

    function handleClick() {
        if (!user) {
            setIsLoginOpen(true);
        } else {
            openModal();
        }
    }

    const handleSliderChange = (e) => {
        setSliderValue(parseInt(e.target.value));
    };

    const [name, setName] = useState("")
    const [address, setAddress] = useState("");
    const [pincode, setPincode] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedDrawingType, setSelectedDrawingType] = useState("");
    const [selectedSheetType, setSelectedSheetType] = useState("");
    const [paymentMode, setPaymentMode] = useState("");
    const [totalAmount, setTotalAmount] = useState(0);
    const [sliderValue, setSliderValue] = useState(1);

    const handleSelectionChange = (drawingType, sheetType) => {
        let calculatedAmount = 0;
        if (drawingType === 'Pencil Sketch' && sheetType === 'A4') {
            calculatedAmount = 549;
        } else if (drawingType === 'Pencil Sketch' && sheetType === 'A3') {
            calculatedAmount = 699;
        } else if (drawingType === 'Colour Painting' && sheetType === 'A4') {
            calculatedAmount = 799;
        }
        else if (drawingType === 'Colour Painting' && sheetType === 'A3') {
            calculatedAmount = 999;
        }
        setTotalAmount(calculatedAmount);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setSelectedImage(file);
    };

    const buyNow = async () => {
        try {
            const emptyFields = [];
            if (name === "") emptyFields.push("Name");
            if (address === "") emptyFields.push("Address");
            if (pincode === "") emptyFields.push("Pincode");
            if (phoneNumber === "") emptyFields.push("Phone Number");
            if (selectedImage === null) emptyFields.push("Image");
            if (selectedDrawingType === "") emptyFields.push("Drawing Type");
            if (selectedSheetType === "") emptyFields.push("Sheet Type");
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

            setLoading(true);

            const downloadURL = await uploadService.uploadFile(selectedImage, 'orders');

            const addressInfo = {
                fullName: name,
                street: address,
                houseNo: address,
                pincode,
                phone: phoneNumber,
            }

            const itemInfo = {
                selectedDrawingType,
                selectedSheetType
            }

            const orderInfo = {
                itemInfo,
                addressInfo,
                date: Timestamp.now(),
                edDate: new Date(new Date().setDate(new Date().getDate() + 12)),
                email: user?.user?.email || user?.email || user?.userProfile?.email || "",
                userEmail: user?.user?.email || user?.email || user?.userProfile?.email || "",
                userid: user?.user?.uid || user?.uid || "",
                image: downloadURL,
                totalAmount: totalAmount + (sliderValue * 50 - 50),
                status: 'Order Placed',
                isCustom: true,
                paymentMode: paymentMode,
                paymentId: null
            }

            if (paymentMode === 'Online Payment') {
                let initiatedViaCloud = false;
                try {
                    const payOrder = await paymentService.createPaymentOrder({
                        items: [
                            {
                                productId: "custom_drawing",
                                variantId: `${selectedDrawingType}_${selectedSheetType}`,
                                quantity: 1
                            }
                        ],
                        couponCode: "",
                        shippingAddress: addressInfo
                    });

                    initiatedViaCloud = true;

                    await paymentService.openRazorpayCheckout({
                        paymentId: payOrder.paymentId,
                        gatewayOrderId: payOrder.gatewayOrderId,
                        amount: payOrder.amount,
                        currency: payOrder.currency,
                        keyId: payOrder.keyId,
                        userProfile: { name, phone: phoneNumber, email: user?.user?.email },
                        onSuccess: () => {
                            toast.success('Payment Received! Order placed successfully.');
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
                        return;
                    }

                    // Client-Side Razorpay Gateway Fallback (Strictly opens Razorpay popup!)
                    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_SUKZpvg7nte0jc";
                    const calculatedAmount = Math.round((totalAmount + (sliderValue * 50 - 50)) * 100);

                    await paymentService.openRazorpayCheckout({
                        paymentId: "pay_custom_" + Date.now(),
                        gatewayOrderId: "",
                        amount: calculatedAmount,
                        currency: "INR",
                        keyId: razorpayKey,
                        userProfile: { name, phone: phoneNumber, email: user?.user?.email },
                        onSuccess: async (response) => {
                            try {
                                orderInfo.paymentId = response.razorpay_payment_id || response.paymentId;
                                await orderService.createOrder(orderInfo);
                                toast.success('Payment Successful! Custom Order Placed.');
                                closeModal();
                            } catch (err) {
                                toast.error(getFriendlyErrorMessage(err, "Failed to record order."));
                            }
                        },
                        onFailure: (errMsg) => {
                            toast.error(getFriendlyErrorMessage(errMsg, "Payment cancelled or failed."));
                        }
                    });
                }
            }
            else {
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
                closeModal();
            }
            setLoading(false);
        } catch (error) {
            toast.error(getFriendlyErrorMessage(error, "Failed to place order. Please try again."));
            setLoading(false);
        }
    }




    return (
        <>

            <div className="bottom-4 right-4">
                <button
                    type="button"
                    onClick={handleClick}
                    className="bg-neutral-950 hover:bg-neutral-950 text-white md:font-bold md:py-3 md:px-6 sm:py-1 sm:px-2 sm:font-medium rounded-full shadow-lg focus:outline-none focus:shadow-outline-purple active:bg-red-800 transition duration-300"
                >
                    Order Now
                </button>
            </div>

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
                                <Dialog.Panel className="min-w-fit transform overflow-hidden rounded-2xl p-2 mt-28 text-left align-middle shadow-xl transition-all bg-gray-50 z-60">
                                    {loading && <Loader />}
                                    <div className="flex flex-col items-center justify-center p-2 mx-auto h-fit	 overflow-y-auto">
                                        <form className="space-y-4 md:space-y-6" action="#">
                                            <div>
                                                <div className="flex flex-col md:flex-row lg:flex-row">
                                                    <div className="pr-2">
                                                        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">Please upload an image</label>
                                                        <input type="file" accept="image/*" onChange={handleImageChange} />
                                                    </div>
                                                    <div>
                                                    <p className="whitespace-nowrap">No. of characters</p>
                                                        <input
                                                            type="range"
                                                            min="1"
                                                            max="5"
                                                            value={sliderValue}
                                                            onChange={handleSliderChange}
                                                            className="sm:w-3/4 md:w-full lg:w-full appearance-none bg-neutral-950 h-1 rounded-md"
                                                        />
                                                        <div className="flex justify-between sm:w-3/4 md:w-full lg:w-full">
                                                            <span>1</span>
                                                            <span>{sliderValue}</span>
                                                            <span>5</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Display image preview */}
                                                {selectedImage && (
                                                    <div className="">
                                                        <div
                                                            className="w-20 h-20 overflow-hidden rounded"
                                                            style={{ aspectRatio: '1/1' }}
                                                        >
                                                            <img
                                                                src={URL.createObjectURL(selectedImage)}
                                                                alt="Image Preview"
                                                                className="object-cover w-full h-full"
                                                                style={{ objectFit: 'contain' }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                            </div>

                                            <div>
                                                <label htmlFor="drawingType" className="block mb-1 text-md font-medium text-gray-900 font-bold">Select Drawing Type & Frame:</label>
                                                <label className="text-sm">
                                                    <input type="radio"
                                                        name="selectedDrawingType"
                                                        value="Pencil Sketch"
                                                        onChange={() => { setSelectedDrawingType('Pencil Sketch'); handleSelectionChange('Pencil Sketch', selectedSheetType) }}
                                                    />
                                                    <span className="ml-2">Pencil Sketch</span>
                                                </label>

                                                <label className="text-sm pl-4">
                                                    <input
                                                        type="radio"
                                                        name="selectedDrawingType"
                                                        value="Colour Painting"
                                                        onChange={() => { setSelectedDrawingType('Colour Painting'); handleSelectionChange('Colour Painting', selectedSheetType) }}
                                                    />
                                                    <span className="ml-2">Colour Painting</span>
                                                </label>
                                            </div>


                                            <div className="flex items-center">
                                                <div className="flex flex-col items-center space-y-1">
                                                    <img
                                                        src="https://firebasestorage.googleapis.com/v0/b/e-commerce-d6aae.appspot.com/o/Modal%20Images%2F2.png?alt=media&token=df7d182e-1314-4b22-83a2-2a214735f0cd"
                                                        alt="Image 2"
                                                        className="w-3/4 h-3/4 object-cover"
                                                    />
                                                    <label className="text-sm">
                                                        <input
                                                            type="radio"
                                                            name="selectedSheetType"
                                                            value="A4 Portrait"
                                                            onChange={() => { setSelectedSheetType('A4'); handleSelectionChange(selectedDrawingType, 'A4') }}
                                                        />
                                                        <span className="ml-2">A4 Page (Smaller)</span>
                                                    </label>
                                                </div>

                                                <div className="flex flex-col items-center space-y-1">
                                                    <img
                                                        src="https://firebasestorage.googleapis.com/v0/b/e-commerce-d6aae.appspot.com/o/Modal%20Images%2F3.png?alt=media&token=52edeff6-3d37-42a6-a534-8170ef474de2"
                                                        alt="Image 3"
                                                        className="w-3/4 h-3/4 object-cover"
                                                    />
                                                    <label className="text-sm">
                                                        <input
                                                            type="radio"
                                                            name="selectedSheetType"
                                                            value="A3 Portrait"
                                                            onChange={() => { setSelectedSheetType('A3'); handleSelectionChange(selectedDrawingType, 'A3') }}
                                                        />  
                                                        <span className="ml-2">A3 Page (Bigger)</span>
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="flex flex-col md:flex-row lg:flex-row ">
                                                <div className="flex-grow sm:pr-0 md:pr-2 lg:pr-2">
                                                    <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-900">Full Name</label>
                                                    <input
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        type="name"
                                                        name="name"
                                                        id="name"
                                                        className="border outline-0 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block min-w-full p-2.5 bg-gray-100"
                                                        required
                                                    />
                                                </div>
                                                <div className="flex-grow sm:pl-0 md:pl-2 lg:pl-2">
                                                    <label htmlFor="mobileNumber" className="block mb-1 text-sm font-medium text-gray-900 sm:mt-1 md:mt-0 lg:mt-0">Mobile Number</label>
                                                    <input
                                                        value={phoneNumber}
                                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                                        type="text"
                                                        name="mobileNumber"
                                                        id="mobileNumber"
                                                        className="border outline-0 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block min-w-full p-2.5 bg-gray-100"
                                                        required
                                                    />
                                                </div>
                                            </div>


                                            <div className="flex flex-col md:flex-row lg:flex-row">
                                                <div className="flex-grow sm:pr-0 md:pr-2 lg:pr-2">
                                                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">Full Address</label>
                                                    <input
                                                        value={address}
                                                        onChange={(e) => setAddress(e.target.value)}
                                                        type="text"
                                                        name="address"
                                                        id="address"
                                                        className="border outline-0 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block min-w-full p-2.5 bg-gray-100"
                                                        required
                                                    />
                                                </div>
                                                <div className="flex-grow sm:pl-0 md:pl-2 lg:pl-2">
                                                    <label htmlFor="pincode" className="block mb-2 md:mt-0 lg:mt-0 sm:mt-1 text-sm font-medium text-gray-900">Pincode</label>
                                                    <input
                                                        value={pincode}
                                                        onChange={(e) => setPincode(e.target.value)}
                                                        type="text"
                                                        name="pincode"
                                                        id="pincode"
                                                        className="border outline-0 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block min-w-full p-2.5 bg-gray-100"
                                                        required
                                                    />
                                                </div>
                                            </div>


                                            <div className="pb-2">
                                                <label className="text-sm">
                                                    <input type="radio"
                                                        name="paymentMode"
                                                        value="COD"
                                                        onChange={() => { setPaymentMode('COD'); }}
                                                    />
                                                    <span className="ml-2">Cash on delivery</span>
                                                </label>

                                                <label className="text-sm pl-4 pr-2">
                                                    <input
                                                        type="radio"
                                                        name="paymentMode"
                                                        value="Online Payment"
                                                        onChange={() => { setPaymentMode('Online Payment'); }}
                                                    />
                                                    <span className="ml-2">Online Payment</span>
                                                </label>

                                                <label className="text-xs md:pl-4 lg:pl-4 sm:hidden">
                                                    <span className="text-red-500">Note:</span> For Cash on Delivery, an additional fee of ₹40 will be applied
                                                </label>
                                            </div>
                                            <label className="text-xs md:hidden lg:hidden">
                                                    <span className="text-red-500">Note:</span> For Cash on Delivery, an additional fee of ₹40 will be applied
                                                </label>

                                            <div className="pb-2 pt-0">
                                                <label className="block text-sm font-medium text-gray-900">
                                                    Total Amount: {`₹${totalAmount}`} + {`₹${sliderValue*50-50}`} (For extra characters)
                                                </label>

                                                {paymentMode === 'COD' && (
                                                    <label className="block text-sm font-medium text-gray-900">
                                                        Additional fee: {`₹${40}`}
                                                    </label>
                                                )}
                                            </div>


                                        </form>
                                        <button onClick={() => { buyNow(); }} type="button" className="focus:outline-none w-full text-white bg-neutral-950 hover:bg-neutral-950  outline-0 font-medium rounded-lg text-sm px-5 py-2.5 ">Order Now</button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    )

}

export default OrderNowModal;