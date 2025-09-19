document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reservation-form");
  const submitButton = form?.querySelector('button[type="submit"]');

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const reservationDate = document.getElementById("date").value.trim();
    const reservationTime = document.getElementById("time").value.trim();
    const reservationGuests = document.getElementById("guests").value.trim();

    // Basic validation for non-empty fields
    if (!reservationDate || !reservationTime || !reservationGuests) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill in all required fields.',
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false
      });
      form.reset();
      return;
    }

    submitButton.disabled = true; // Disable button during submission

    try {
      const response = await fetch('/api/reservation/insertReservation.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ 
          date: reservationDate, 
          time: reservationTime, 
          guests: reservationGuests 
        })
      });

      // Check if response is JSON
      if (!response.headers.get('content-type')?.includes('application/json')) {
        throw new Error('Invalid response format from server.');
      }

      const data = await response.json();
      if (!response.ok) {
        Swal.fire({
          icon: 'error',
          title: 'Reservation Failed',
          text: data.message || `Server error: ${response.status}`,
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        });
        form.reset();
        
        return;
      }

      // Success
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Reservation successful!',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
    } catch (error) {
      const errorMsg = error.message.includes('Failed to fetch')
        ? 'Network error: Unable to connect to the server.'
        : error.message || 'An unexpected error occurred.';
      Swal.fire({
        icon: 'error',
        title: 'Reservation Failed',
        text: errorMsg,
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
      form.reset();
    } finally {
      submitButton.disabled = false; // Re-enable button
    }
  });
});