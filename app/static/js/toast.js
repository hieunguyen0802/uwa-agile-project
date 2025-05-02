// Toast Notification System
class ToastNotification {
  constructor() {
    this.container = null;
    this.initContainer();
  }

  initContainer() {
    // Check if container already exists
    this.container = document.getElementById('toast-container');
    
    if (!this.container) {
      // Create container if it doesn't exist
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'fixed top-4 right-4 flex flex-col items-end z-50';
      document.body.appendChild(this.container);
    }
  }

  show(type, content, duration = 3000) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `flex items-center rounded-md shadow-md px-4 py-3 mb-3 transform transition-all duration-300 ease-in-out translate-x-full`;
    
    // Set background color based on type
    let icon = '';
    switch (type) {
      case 'success':
        toast.classList.add('bg-green-50', 'text-green-800', 'border-l-4', 'border-green-500');
        icon = '<i class="fas fa-check-circle mr-2 text-green-500"></i>';
        break;
      case 'error':
        toast.classList.add('bg-red-50', 'text-red-800', 'border-l-4', 'border-red-500');
        icon = '<i class="fas fa-times-circle mr-2 text-red-500"></i>';
        break;
      case 'warning':
        toast.classList.add('bg-yellow-50', 'text-yellow-800', 'border-l-4', 'border-yellow-500');
        icon = '<i class="fas fa-exclamation-circle mr-2 text-yellow-500"></i>';
        break;
      case 'info':
      default:
        toast.classList.add('bg-blue-50', 'text-blue-800', 'border-l-4', 'border-blue-500');
        icon = '<i class="fas fa-info-circle mr-2 text-blue-500"></i>';
        break;
    }
    
    // Set content
    toast.innerHTML = `${icon}<span>${content}</span>`;
    
    // Add to container
    this.container.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-x-full');
    }, 10);
    
    // Auto remove after duration
    setTimeout(() => {
      toast.classList.add('translate-x-full', 'opacity-0');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, duration);
  }
  
  success(content, duration) {
    this.show('success', content, duration);
  }
  
  error(content, duration) {
    this.show('error', content, duration);
  }
  
  warning(content, duration) {
    this.show('warning', content, duration);
  }
  
  info(content, duration) {
    this.show('info', content, duration);
  }
}

// Create global toast instance
const toast = new ToastNotification(); 