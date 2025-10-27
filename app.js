// Variables globales
let products = [];
let currentPage = 1;
const itemsPerPage = 10;
let cart = [];
let orderCounter = localStorage.getItem('gonzacarsOrderCounter') || 1;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupEventListeners();
});

// Cargar productos (simulando conexión con Google Sheets)
function loadProducts() {
    // En una implementación real, aquí se haría una llamada a la API de Google Sheets
    // Por ahora, simulamos datos de ejemplo
    
    // Datos de ejemplo basados en la estructura proporcionada
    products = [
        { idinventario: "GZ001", descripcion: "Filtro de Aceite Toyota Corolla 2015", stockInicial: 50, stockActual: 35, stockFinal: 35, costo: 8.50, precioVenta: 15.99 },
        { idinventario: "GZ002", descripcion: "Pastillas de Freno Delanteras Honda Civic", stockInicial: 30, stockActual: 12, stockFinal: 12, costo: 25.00, precioVenta: 45.50 },
        { idinventario: "GZ003", descripcion: "Batería 12V 60Ah", stockInicial: 20, stockActual: 5, stockFinal: 5, costo: 65.00, precioVenta: 110.00 },
        { idinventario: "GZ004", descripcion: "Aceite Motor 5W30 Sintético 1L", stockInicial: 100, stockActual: 42, stockFinal: 42, costo: 7.50, precioVenta: 12.99 },
        { idinventario: "GZ005", descripcion: "Amortiguador Trasero Nissan Sentra", stockInicial: 15, stockActual: 0, stockFinal: 0, costo: 45.00, precioVenta: 78.00 },
        { idinventario: "GZ006", descripcion: "Bujías Iridium x4", stockInicial: 40, stockActual: 22, stockFinal: 22, costo: 12.00, precioVenta: 22.50 },
        { idinventario: "GZ007", descripcion: "Correa de Distribución", stockInicial: 25, stockActual: 8, stockFinal: 8, costo: 18.00, precioVenta: 32.00 },
        { idinventario: "GZ008", descripcion: "Líquido de Frenos DOT4", stockInicial: 60, stockActual: 28, stockFinal: 28, costo: 4.50, precioVenta: 8.99 },
        { idinventario: "GZ009", descripcion: "Radiador Hyundai Accent", stockInicial: 10, stockActual: 3, stockFinal: 3, costo: 85.00, precioVenta: 145.00 },
        { idinventario: "GZ010", descripcion: "Sensor de Oxígeno Universal", stockInicial: 35, stockActual: 15, stockFinal: 15, costo: 22.00, precioVenta: 39.99 },
        { idinventario: "GZ011", descripcion: "Termostato Motor", stockInicial: 40, stockActual: 18, stockFinal: 18, costo: 9.50, precioVenta: 17.50 },
        { idinventario: "GZ012", descripcion: "Filtro de Aire Cabina", stockInicial: 55, stockActual: 30, stockFinal: 30, costo: 6.00, precioVenta: 11.99 }
    ];
    
    renderProducts();
    updateProductCount();
}

// Configurar event listeners
function setupEventListeners() {
    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    document.getElementById('resetFilters').addEventListener('click', resetFilters);
    document.getElementById('refreshCatalog').addEventListener('click', loadProducts);
    document.getElementById('generateOrder').addEventListener('click', generateOrderPDF);
    document.getElementById('clearCart').addEventListener('click', clearCart);
    document.getElementById('confirmAddToCart').addEventListener('click', addToCart);
    document.getElementById('searchInput').addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            applyFilters();
        }
    });
}

// Renderizar productos en la tabla
function renderProducts(filteredProducts = products) {
    const tableBody = document.getElementById('productsTableBody');
    tableBody.innerHTML = '';
    
    // Calcular índices para la paginación
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredProducts.length);
    const currentProducts = filteredProducts.slice(startIndex, endIndex);
    
    if (currentProducts.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No se encontraron productos</td></tr>';
        renderPagination(0);
        return;
    }
    
    currentProducts.forEach(product => {
        const row = document.createElement('tr');
        
        // Determinar clase de stock
        let stockClass = 'bg-success';
        if (product.stockActual === 0) {
            stockClass = 'bg-danger';
        } else if (product.stockActual < 10) {
            stockClass = 'bg-warning';
        }
        
        row.innerHTML = `
            <td>${product.idinventario}</td>
            <td>${product.descripcion}</td>
            <td><span class="badge ${stockClass} badge-stock">${product.stockActual}</span></td>
            <td>$${product.precioVenta.toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary add-to-cart-btn" 
                        data-id="${product.idinventario}"
                        data-desc="${product.descripcion}"
                        data-price="${product.precioVenta}"
                        data-stock="${product.stockActual}">
                    Agregar al Carrito
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Agregar event listeners a los botones de agregar al carrito
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function() {
            openAddToCartModal(
                this.getAttribute('data-id'),
                this.getAttribute('data-desc'),
                this.getAttribute('data-price'),
                this.getAttribute('data-stock')
            );
        });
    });
    
    // Renderizar paginación
    renderPagination(filteredProducts.length);
}

// Renderizar paginación
function renderPagination(totalItems) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    // Botón anterior
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#">Anterior</a>`;
    prevLi.addEventListener('click', function(e) {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            renderProducts();
        }
    });
    pagination.appendChild(prevLi);
    
    // Números de página
    for (let i = 1; i <= totalPages; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${currentPage === i ? 'active' : ''}`;
        pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        pageLi.addEventListener('click', function(e) {
            e.preventDefault();
            currentPage = i;
            renderProducts();
        });
        pagination.appendChild(pageLi);
    }
    
    // Botón siguiente
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#">Siguiente</a>`;
    nextLi.addEventListener('click', function(e) {
        e.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            renderProducts();
        }
    });
    pagination.appendChild(nextLi);
}

// Aplicar filtros
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const stockFilter = document.getElementById('stockFilter').value;
    
    let filteredProducts = products;
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product => 
            product.descripcion.toLowerCase().includes(searchTerm)
        );
    }
    
    // Filtrar por stock
    if (stockFilter === 'available') {
        filteredProducts = filteredProducts.filter(product => product.stockActual > 0);
    } else if (stockFilter === 'low') {
        filteredProducts = filteredProducts.filter(product => product.stockActual > 0 && product.stockActual < 10);
    } else if (stockFilter === 'out') {
        filteredProducts = filteredProducts.filter(product => product.stockActual === 0);
    }
    
    currentPage = 1;
    renderProducts(filteredProducts);
    updateProductCount(filteredProducts.length);
}

// Restablecer filtros
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('stockFilter').value = 'all';
    currentPage = 1;
    renderProducts();
    updateProductCount();
}

// Actualizar contador de productos
function updateProductCount(count = products.length) {
    document.getElementById('productCount').textContent = `${count} productos`;
}

// Abrir modal para agregar al carrito
function openAddToCartModal(id, description, price, stock) {
    document.getElementById('productId').value = id;
    document.getElementById('productDescription').value = description;
    document.getElementById('productPrice').value = `$${parseFloat(price).toFixed(2)}`;
    document.getElementById('productStock').value = stock;
    document.getElementById('quantity').value = 1;
    document.getElementById('quantity').max = stock;
    document.getElementById('sellerName').value = '';
    
    const modal = new bootstrap.Modal(document.getElementById('addToCartModal'));
    modal.show();
}

// Agregar producto al carrito
function addToCart() {
    const id = document.getElementById('productId').value;
    const description = document.getElementById('productDescription').value;
    const price = parseFloat(document.getElementById('productPrice').value.replace('$', ''));
    const quantity = parseInt(document.getElementById('quantity').value);
    const sellerName = document.getElementById('sellerName').value;
    
    if (!sellerName) {
        alert('Por favor ingrese el nombre del vendedor');
        return;
    }
    
    // Verificar si el producto ya está en el carrito
    const existingItemIndex = cart.findIndex(item => item.id === id);
    
    if (existingItemIndex !== -1) {
        // Actualizar cantidad si ya existe
        cart[existingItemIndex].quantity += quantity;
        cart[existingItemIndex].total = cart[existingItemIndex].quantity * price;
    } else {
        // Agregar nuevo item al carrito
        cart.push({
            id: id,
            description: description,
            price: price,
            quantity: quantity,
            total: price * quantity,
            sellerName: sellerName
        });
    }
    
    updateCartDisplay();
    
    // Cerrar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addToCartModal'));
    modal.hide();
}

// Actualizar visualización del carrito
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="text-muted">No hay productos en el carrito</p>';
        document.getElementById('generateOrder').disabled = true;
        document.getElementById('clearCart').disabled = true;
        return;
    }
    
    let html = '';
    let total = 0;
    
    cart.forEach(item => {
        html += `
            <div class="cart-item">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <small><strong>${item.id}</strong></small><br>
                        <small>${item.description}</small><br>
                        <small>Cant: ${item.quantity} x $${item.price.toFixed(2)}</small>
                    </div>
                    <div>
                        <small>$${item.total.toFixed(2)}</small>
                    </div>
                </div>
            </div>
        `;
        total += item.total;
    });
    
    html += `<div class="cart-total d-flex justify-content-between mt-2">
                <span>Total:</span>
                <span>$${total.toFixed(2)}</span>
            </div>`;
    
    cartItems.innerHTML = html;
    document.getElementById('generateOrder').disabled = false;
    document.getElementById('clearCart').disabled = false;
}

// Vaciar carrito
function clearCart() {
    cart = [];
    updateCartDisplay();
}

// Generar PDF del pedido
function generateOrderPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Número correlativo
    const orderNumber = `TG-${orderCounter.toString().padStart(7, '0')}`;
    orderCounter++;
    localStorage.setItem('gonzacarsOrderCounter', orderCounter);
    
    // Fecha actual
    const today = new Date();
    const dateStr = today.toLocaleDateString('es-ES');
    
    // Encabezado
    doc.setFontSize(20);
    doc.setTextColor(26, 60, 110); // Color primario
    doc.text('GONZACARS', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Sistema de Pedidos - Catálogo de Repuestos', 105, 30, { align: 'center' });
    
    // Información del pedido
    doc.setFontSize(10);
    doc.text(`Número de Pedido: ${orderNumber}`, 20, 45);
    doc.text(`Fecha: ${dateStr}`, 20, 52);
    doc.text(`Vendedor: ${cart[0].sellerName}`, 20, 59);
    
    // Tabla de productos
    const tableColumn = ["ID", "Descripción", "Cantidad", "Precio", "Total"];
    const tableRows = [];
    
    let grandTotal = 0;
    
    cart.forEach(item => {
        const productData = [
            item.id,
            item.description,
            item.quantity.toString(),
            `$${item.price.toFixed(2)}`,
            `$${item.total.toFixed(2)}`
        ];
        tableRows.push(productData);
        grandTotal += item.total;
    });
    
    // Agregar fila de total
    tableRows.push(["", "", "", "TOTAL:", `$${grandTotal.toFixed(2)}`]);
    
    doc.autoTable({
        startY: 70,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [26, 60, 110] }
    });
    
    // Pie de página
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(8);
    doc.text('Este documento fue generado automáticamente por el sistema de pedidos de Gonzacars.', 105, finalY, { align: 'center' });
    
    // Guardar PDF
    doc.save(`Pedido_${orderNumber}_${dateStr.replace(/\//g, '-')}.pdf`);
    
    // Limpiar carrito después de generar el pedido
    clearCart();
    
    // Mostrar mensaje de éxito
    alert(`Pedido ${orderNumber} generado exitosamente. El PDF se ha descargado.`);
}