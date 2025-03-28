export const toast = {
  error: (message) => {
    console.error(message);
    // You can replace this with a proper toast notification library
    alert(message);
  },
  success: (message) => {
    console.log(message);
    // You can replace this with a proper toast notification library
    alert(message);
  }
};