# JOSEPHINE-S-BACKYARD-STEAKHOUSE 

- **Frontend:** HTML + TailwindCSS  
- **DOM Manipulation:** JavaScript  
- **Backend:** PHP  
- **Database:** MySQL  

---

## 📂 Folder Structure

project-root/
- index.html → Landing page  
- .htaccess → (optional) routing/security for PHP  
- config.php → Database connection settings  

public/ → Static frontend (HTML, CSS, JS, images)     
    ├─ js/  
    │   ├─ main.js → General UI scripts  
    │   ├─ order.js → Handles order requests  
    │   ├─ reservation.js → Handles reservation requests  
    │   └─ admin.js → Handles admin dashboard requests  
    └─ images/  

views/ → Frontend pages (HTML only)  
    ├─ user/ → Client (Customer) Interface  
    │   ├─ home.html  
    │   ├─ menu.html  
    │   ├─ reservation.html  
    │   └─ order.html  
    └─ admin/ → CMS (Admin Interface)  
        ├─ dashboard.html  
        ├─ manage_menu.html  
        ├─ manage_orders.html  
        └─ manage_reservations.html  

api/ → PHP backend (acts like REST API)  
    ├─ orders.php → CRUD for orders  
    ├─ reservations.php → CRUD for reservations  
    ├─ menu.php → Manage menu items  
    ├─ users.php → User login/signup  
    └─ admin.php → Admin-specific actions  

models/ → DB queries (PHP classes/functions)  
    ├─ Order.php  
    ├─ Reservation.php  
    ├─ Menu.php  
    └─ User.php  

controllers/ → Business logic (calls models)  
    ├─ OrderController.php  
    ├─ ReservationController.php  
    ├─ MenuController.php  
    └─ UserController.php  

docs/ → Thesis docs, diagrams, ERD  
