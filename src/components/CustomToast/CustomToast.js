import { toast } from 'react-toastify';

import './CustomToast.css';

export const customToast = {
    success(msg, options = {}) {
        return toast.success(msg, {
            toastId: 'toast-success',
            position: 'top-center',
            autoClose: 3000,
            ...options,
            hideProgressBar: true,
            className: 'custom-toast-container',
            progressClassName: 'custom-toast-progress-success'
        });
    },
    error(msg, options = {}) {
        return toast.error(msg, {
            toastId: 'toast-error',
            position: 'top-center',
            autoClose: 3000,
            ...options,
            hideProgressBar: true,
            className: 'custom-toast-container',
            progressClassName: 'custom-toast-progress-error'
        });
    },
    info(msg, options = {}) {
        return toast.info(msg, {
            toastId: 'toast-info',
            position: 'top-center',
            autoClose: 3000,
            ...options,
            hideProgressBar: true,
            className: 'custom-toast-container',
            progressClassName: 'custom-toast-progress-info'
        });
    },
    warn(msg, options = {}) {
        return toast.warn(msg, {
            toastId: 'toast-warn',
            position: 'top-center',
            autoClose: 3000,
            ...options,
            hideProgressBar: true,
            className: 'custom-toast-container',
            progressClassName: 'custom-toast-progress-warn'
        });
    }

};
