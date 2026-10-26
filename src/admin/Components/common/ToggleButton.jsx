import React from 'react';

/**
 * Reusable ToggleButton Component (Switch)
 * 
 * Supports different sizes, colors, icons, labels, descriptions, and disabled states.
 * Fully accessible with WAI-ARIA role="switch".
 *
 * @param {Object} props
 * @param {boolean} props.checked - Current toggled state
 * @param {Function} props.onChange - Callback fired when toggle changes: (checked, event) => void
 * @param {string|React.ReactNode} [props.label] - Optional primary label text displayed next to switch
 * @param {string|React.ReactNode} [props.description] - Optional subtext/description below label
 * @param {boolean} [props.disabled=false] - Disable interactions
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Switch size variant
 * @param {'primary'|'success'|'danger'|'purple'|'blue'} [props.color='primary'] - Active track color theme
 * @param {React.ReactNode} [props.onIcon] - Icon shown when active (inside knob)
 * @param {React.ReactNode} [props.offIcon] - Icon shown when inactive (inside knob)
 * @param {string} [props.onLabel] - Text shown on track when active
 * @param {string} [props.offLabel] - Text shown on track when inactive
 * @param {'bottom'|'side'|'left'|'right'} [props.labelPosition='bottom'] - Position of label & description text relative to switch
 * @param {string} [props.id] - Optional HTML id
 * @param {string} [props.name] - Optional HTML name for forms
 * @param {string} [props.className=''] - Additional outer container class names
 */
function ToggleButton({
    checked = false,
    onChange,
    label,
    description,
    disabled = false,
    size = 'md',
    color = 'primary',
    onIcon,
    offIcon,
    onLabel,
    offLabel,
    labelPosition = 'bottom',
    id,
    name,
    className = '',
}) {
    const handleToggle = (e) => {
        if (disabled) return;
        if (e && typeof e.stopPropagation === 'function') {
            e.stopPropagation();
        }
        if (onChange) {
            onChange(!checked, e);
        }
    };

    const handleKeyDown = (e) => {
        if (disabled) return;
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleToggle(e);
        }
    };

    // Size mappings
    const sizeConfig = {
        sm: {
            track: 'w-8 h-4.5 p-0.5',
            knob: 'w-3.5 h-3.5',
            translate: 'translate-x-3.5',
            textSize: 'text-xs',
            descSize: 'text-[10px]',
            iconSize: 'text-[8px]',
        },
        md: {
            track: 'w-11 h-6 p-0.5',
            knob: 'w-5 h-5',
            translate: 'translate-x-5',
            textSize: 'text-xs sm:text-sm',
            descSize: 'text-xs',
            iconSize: 'text-[10px]',
        },
        lg: {
            track: 'w-14 h-7.5 p-1',
            knob: 'w-5.5 h-5.5',
            translate: 'translate-x-6.5',
            textSize: 'text-sm sm:text-base',
            descSize: 'text-xs',
            iconSize: 'text-xs',
        },
    };

    // Active Track Color mappings
    const colorConfig = {
        primary: 'bg-primary hover:bg-primary-hover border-primary/20',
        success: 'bg-emerald-600 hover:bg-emerald-700 border-emerald-500/20',
        danger: 'bg-rose-600 hover:bg-rose-700 border-rose-500/20',
        purple: 'bg-purple-600 hover:bg-purple-700 border-purple-500/20',
        blue: 'bg-blue-600 hover:bg-blue-700 border-blue-500/20',
    };

    const currentSize = sizeConfig[size] || sizeConfig.md;
    const activeColorClass = colorConfig[color] || colorConfig.primary;

    const trackClasses = `
        relative inline-flex items-center shrink-0 cursor-pointer rounded-full border transition-colors duration-300 ease-in-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2
        ${currentSize.track}
        ${checked ? activeColorClass : 'bg-bg-base border-border-subtle hover:bg-card-hover'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}
    `.trim();

    const knobClasses = `
        pointer-events-none transform rounded-full bg-white border border-primary shadow-xl ring-0 transition-transform duration-300 ease-in-out
        flex items-center justify-center text-text-base
        ${currentSize.knob}
        ${checked ? currentSize.translate : 'translate-x-0 '}
    `.trim();

    const displayLabel = label || (checked ? onLabel : offLabel);

    const renderSwitch = () => (
        <button
            type="button"
            role="switch"
            id={id}
            name={name}
            aria-checked={checked}
            aria-disabled={disabled}
            disabled={disabled}
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            className={trackClasses}
        >
            {/* Sliding Knob */}
            <span className={knobClasses}>
                {checked ? (
                    onIcon && <span className={currentSize.iconSize}>{onIcon}</span>
                ) : (
                    offIcon && <span className={currentSize.iconSize}>{offIcon}</span>
                )}
            </span>
        </button>
    );

    // If no displayLabel or description provided, render standalone switch
    if (!displayLabel && !description) {
        return (
            <div className={`inline-flex items-center ${className}`}>
                {renderSwitch()}
            </div>
        );
    }

    // Render label & description below switch if labelPosition is 'bottom'
    if (labelPosition === 'bottom') {
        return (
            <div
                onClick={handleToggle}
                className={`group inline-flex flex-col items-center justify-center text-center select-none ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${className}`}
            >
                <div>
                    {renderSwitch()}
                </div>
                {(displayLabel || description) && (
                    <div className="">
                        {displayLabel && (
                            <span className={`font-semibold text-text-base block ${currentSize.textSize} ${disabled ? '' : 'group-hover:text-primary transition-colors'}`}>
                                {displayLabel}
                            </span>
                        )}
                        {description && (
                            <p className={`text-text-muted  ${currentSize.descSize}`}>
                                {description}
                            </p>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // Default side-by-side layout
    return (
        <div
            onClick={handleToggle}
            className={`group flex items-center justify-between gap-2.5 select-none ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${className}`}
        >
            <div className="pt-0.5 ">
                {renderSwitch()}
            </div>
            <div className="flex-1 min-w-0">
                {displayLabel && (
                    <span className={`font-bold text-text-base block ${currentSize.textSize} ${disabled ? '' : 'group-hover:text-primary transition-colors'}`}>
                        {displayLabel}
                    </span>
                )}
                {description && (
                    <p className={`text-text-muted  ${currentSize.descSize}`}>
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}

export default ToggleButton;
