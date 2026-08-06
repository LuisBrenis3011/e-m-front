import Swal from 'sweetalert2';

export async function confirmDelete(message = 'Estas seguro?') {
  const result = await Swal.fire({
    title: 'Confirmar',
    text: message,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar',
  });
  return result.isConfirmed;
}

export async function confirmAction(title: string, text: string, confirmText = 'Confirmar', color = '#3B82F6') {
  const result = await Swal.fire({
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: color,
    cancelButtonColor: '#64748b',
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancelar',
  });
  return result.isConfirmed;
}

export function showError(message: string) {
  return Swal.fire({ icon: 'error', title: 'Error', text: message, confirmButtonColor: '#3B82F6' });
}

export function showSuccess(message: string) {
  return Swal.fire({ icon: 'success', title: 'Exito', text: message, timer: 2000, showConfirmButton: false });
}

export function showInfo(message: string) {
  return Swal.fire({ icon: 'info', title: 'Informacion', text: message, confirmButtonColor: '#3B82F6' });
}

export async function promptInput(title: string, label: string) {
  const result = await Swal.fire({
    title,
    input: 'text',
    inputLabel: label,
    inputPlaceholder: label,
    showCancelButton: true,
    confirmButtonColor: '#3B82F6',
    confirmButtonText: 'Aceptar',
    cancelButtonText: 'Cancelar',
    inputValidator: (value) => {
      if (!value) return 'Este campo es obligatorio';
      return null;
    },
  });
  return result.value ?? null;
}
