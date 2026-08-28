// Global utilities for ExamPro

window.ExamPro = window.ExamPro || {};

window.ExamPro.Utils = {
  showToast: function(message, type = 'success') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.style.position = 'fixed';
      toastContainer.style.bottom = '20px';
      toastContainer.style.right = '20px';
      toastContainer.style.zIndex = '9999';
      toastContainer.style.display = 'flex';
      toastContainer.style.flexDirection = 'column';
      toastContainer.style.gap = '10px';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '8px';
    toast.style.color = '#fff';
    toast.style.fontWeight = '500';
    toast.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    
    if (type === 'success') toast.style.backgroundColor = 'var(--success-color, #10B981)';
    else if (type === 'error') toast.style.backgroundColor = 'var(--error-color, #EF4444)';
    else if (type === 'warning') toast.style.backgroundColor = 'var(--warning-color, #F59E0B)';
    else toast.style.backgroundColor = 'var(--primary-color, #4F46E5)';

    toast.innerText = message;
    toastContainer.appendChild(toast);

    // animate in
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  },

  formatDate: function(dateStr) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  }
};
