

export const alertMessage = (type, title, text, timer=1500) => {
    Swal.fire({
        icon: type,
        title: title,
        text: text,
        timer: timer,
        allowOutsideClick: false,
        showConfirmButton: false,
        showCancelButton: false,
    })
}
  export const successMessage = async(title, text, timer=1500) => {
    Swal.fire({
        icon: 'success',
        title: title,
        text: text,
        timer: timer,
        allowOutsideClick: false,
        showConfirmButton: false,
        showCancelButton: false,
    })
}