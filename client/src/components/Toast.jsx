import toast from 'react-hot-toast';

export function showToast(message, type = 'success') {
  if (type === 'success') toast.success(message);
  else if (type === 'error') toast.error(message);
  else toast(message);
}

export default function Toast() {
  return null;
}
