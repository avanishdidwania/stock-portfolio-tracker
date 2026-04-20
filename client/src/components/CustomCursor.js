import React, { useEffect, useState, useRef } from 'react';
import './CustomCursor.css';

const CustomCursor = () => {
    const cursor = useRef(null);
    const [cursorVisible, setCursorVisible] = useState(false);
    const [cursorEnlarged, setCursorEnlarged] = useState(false);

    // Track mouse position
    const endX = useRef(window.innerWidth / 2);
    const endY = useRef(window.innerHeight / 2);
    // Track current cursor position (for trailing)
    const _x = useRef(0);
    const _y = useRef(0);

    const requestRef = useRef(null);

    useEffect(() => {
        if (window.innerWidth < 768) return;
        
        const mouseMoveEvent = (e) => {
            setCursorVisible(true);
            endX.current = e.clientX;
            endY.current = e.clientY;
        };

        const mouseEnterEvent = () => setCursorVisible(true);
        const mouseLeaveEvent = () => setCursorVisible(false);
        const mouseDownEvent = () => setCursorEnlarged(true);
        const mouseUpEvent = () => setCursorEnlarged(false);

        document.addEventListener('mousemove', mouseMoveEvent);
        document.addEventListener('mouseenter', mouseEnterEvent);
        document.addEventListener('mouseleave', mouseLeaveEvent);
        document.addEventListener('mousedown', mouseDownEvent);
        document.addEventListener('mouseup', mouseUpEvent);

        const handleLinkHoverEvents = () => {
            document.querySelectorAll('a, button, input, textarea, .toggle-switch, .remember-me, .forgot-password, .nav-logo, .login-logo-link').forEach(el => {
                el.removeEventListener('mouseenter', mouseDownEvent);
                el.removeEventListener('mouseleave', mouseUpEvent);
                el.addEventListener('mouseenter', mouseDownEvent);
                el.addEventListener('mouseleave', mouseUpEvent);
            });
        };

        handleLinkHoverEvents();
        const observer = new MutationObserver(handleLinkHoverEvents);
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            document.removeEventListener('mousemove', mouseMoveEvent);
            document.removeEventListener('mouseenter', mouseEnterEvent);
            document.removeEventListener('mouseleave', mouseLeaveEvent);
            document.removeEventListener('mousedown', mouseDownEvent);
            document.removeEventListener('mouseup', mouseUpEvent);
            observer.disconnect();
        };
    }, []);

    // Smooth trailing animation loop
    useEffect(() => {
        if (window.innerWidth < 768) return;
        
        const animateCursor = () => {
            // Speed of the trailing effect (lower denominator = faster catchup)
            _x.current += (endX.current - _x.current) / 4; 
            _y.current += (endY.current - _y.current) / 4;
            
            if (cursor.current) {
                cursor.current.style.transform = `translate3d(${_x.current}px, ${_y.current}px, 0)`;
            }
            requestRef.current = requestAnimationFrame(animateCursor);
        };

        requestRef.current = requestAnimationFrame(animateCursor);

        return () => cancelAnimationFrame(requestRef.current);
    }, []);

    if (typeof window !== 'undefined' && window.innerWidth < 768) return null;

    return (
        <div ref={cursor} className={`smooth-cursor-wrapper ${cursorVisible ? 'visible' : ''}`}>
            <div className={`smooth-cursor-dot ${cursorEnlarged ? 'enlarged' : ''}`}></div>
        </div>
    );
};

export default CustomCursor;
