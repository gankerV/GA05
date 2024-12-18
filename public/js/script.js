window.onload = function () {
    const url = new URL(window.location.href);

    // Đánh dấu các giá trị đã chọn
    document
        .querySelectorAll(
            'input[name="category"], input[name="size"], input[name="color"], input[name="brand"], input[name="rating"]',
        )
        .forEach((input) => {
            const value = input.value;
            const values = url.searchParams.getAll(input.name); // Lấy danh sách giá trị
            if (values.includes(value)) {
                input.checked = true; // Giữ trạng thái checked
                input.parentElement.classList.add("selected"); // Cập nhật giao diện
            }
        });

    // Giữ giá trị tìm kiếm trong ô input
    const searchInput = document.getElementById("search-input");
    const productName = url.searchParams.get("product_name"); // Lấy giá trị product_name
    if (productName) {
        searchInput.value = productName; // Gán lại giá trị vào input
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const clearButton = document.getElementById("clear-filters");
    const searchButton = document.getElementById("search-button");
    const searchInput = document.getElementById("search-input");

    // Thêm listener cho nút tìm kiếm
    searchButton.addEventListener("click", () => {
        const searchValue = searchInput.value.trim();

        // Gọi hàm gửi yêu cầu với thông tin tìm kiếm
        fetchAndDisplayResults(searchValue, currentFilters);
    });

    // Gắn sự kiện cho ô tìm kiếm: Gửi AJAX nếu nhấn Enter
    searchInput.addEventListener("keyup", (event) => {
        const searchValue = searchInput.value.trim();
        if (event.key === "Enter") {
            fetchAndDisplayResults(searchValue, currentFilters);
        }
    });
    // Xử lý nút Clear Filter
    clearButton.addEventListener("click", () => {
        searchInput.value = ""; // Làm sạch ô tìm kiếm
        currentFilters = {};
        fetchAndDisplayResults(searchValue, currentFilters);
    });
});

// Lưu trạng thái của bộ lọc
let currentFilters = {};

function applyFilter(key, value, element) {
    if (!currentFilters[key]) {
        currentFilters[key] = [];
    }

    if (element.checked) {
        if (!currentFilters[key].includes(value)) {
            currentFilters[key].push(value);
        }
    } else {
        currentFilters[key] = currentFilters[key].filter(
            (item) => item !== value,
        );
        if (currentFilters[key].length === 0) {
            delete currentFilters[key];
        }
    }

    // Trigger AJAX sau mỗi thay đổi filter
    fetchAndDisplayResults(
        document.getElementById("search-input").value.trim(),
        currentFilters,
    );
}

// Tạo Query String từ productName và filters
function createQueryString(productName, filters) {
    const params = new URLSearchParams();
    if (productName) params.set("product_name", productName);
    if (filters) {
        for (const key in filters) {
            if (filters[key]) params.set(key, filters[key]);
        }
    }
    return params.toString();
}

// Lấy và hiển thị kết quả tìm kiếm và bộ lọc
function fetchAndDisplayResults(productName, filters) {
    const queryString = createQueryString(productName, filters);
    const newURL = `/shop?${queryString}`;

    fetch(`/shop/api?${queryString}`)
        .then((response) => response.json())
        .then((data) => {
            displayProducts(data.products);
            displayPagination(data.currentPage, data.totalPages);

            // Cập nhật URL chỉ một lần
            history.replaceState({ filters, productName }, "", newURL);
        })
        .catch((error) =>
            console.error("Error fetching search/filter results:", error),
        );
}

async function fetchProducts(page) {
    try {
        // Lấy thông tin lọc từ URL hiện tại
        const urlParams = new URLSearchParams(window.location.search);
        const productName = urlParams.get("product_name") || "";
        const filters = {
            category: urlParams.get("category") || ""
        };

        // Sử dụng hàm createQueryString để xây dựng query string
        const queryString = createQueryString(productName, { ...filters, page });

        // Fetch dữ liệu từ API
        const response = await fetch(`/shop/api?${queryString}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Hiển thị dữ liệu lên giao diện
        displayProducts(data.products);
        displayPagination(data.currentPage, data.totalPages);

        // Cập nhật URL với thông tin mới
        history.replaceState(null, "", `/shop?${queryString}`);
    } catch (error) {
        console.error("Error fetching products:", error.message || error);
    }
}

function displayProducts(products) {
    const productList = document.getElementById("product-list");
    productList.innerHTML = "";

    products.forEach((product) => {
        // Tạo một sản phẩm dưới dạng HTML
        const productHTML = document.createElement("div");
        productHTML.classList.add("bg-white", "p-4", "rounded-lg", "shadow");
        productHTML.innerHTML = `
            <a href="/shop/product/${product.id}">
                <img src="${product.imageUrl}" alt="${product.product_name}" class="w-full object-cover mb-4 rounded-lg" />
            </a>
            <a href="/shop/product/${product.id}" class="text-lg font-semibold mb-2">${product.product_name}</a>
            <div class="flex items-center mb-4">
                <span class="text-lg font-bold text-primary">$${product.price}</span>
            </div>
            <div class="mb-4">
                <span class="text-sm font-medium text-gray-600">Category:</span>
                <span class="text-sm font-semibold">${product.category}</span>
            </div>
            <div class="mb-4">
                <span class="text-sm font-medium text-gray-600">Size:</span>
                <span class="text-sm font-semibold">${product.size}</span>
            </div>
            <div class="mb-4">
                <span class="text-sm font-medium text-gray-600">Color:</span>
                <span class="text-sm font-semibold">${product.color}</span>
            </div>
            <div class="mb-4">
                <span class="text-sm font-medium text-gray-600">Brand:</span>
                <span class="text-sm font-semibold">${product.brand}</span>
            </div>
            <div class="mb-4">
                <span class="text-sm font-medium text-gray-600">Rating:</span>
                <span class="text-sm font-semibold">${product.rating}/5</span>
            </div>
            <div class="add-to-cart-form" data-product-id="${product.id}">
                <button class="add-to-cart-btn bg-primary border border-transparent hover:bg-transparent hover:border-primary text-white hover:text-primary font-semibold py-2 px-4 rounded-full w-full">
                    Add to Cart
                </button>
            </div>
        `;

        // Thêm sản phẩm vào danh sách
        productList.appendChild(productHTML);
    });

    // Gắn sự kiện cho các nút "Add to Cart"
    attachAddToCartEvents();
}

function attachAddToCartEvents() {
    // Lấy tất cả các nút "Add to Cart"
    const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");

    addToCartButtons.forEach((button) => {
        button.addEventListener("click", function () {
            // Lấy form cha của nút
            const form = button.closest(".add-to-cart-form");

            // Lấy product_id từ form
            const productId = form.getAttribute("data-product-id");

            // Đặt quantity luôn bằng 1
            const payload = { product_id: productId, quantity: 1 };

            // Gửi yêu cầu AJAX tới server
            fetch("/user/cart/add-product", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
                redirect: "follow", // Cho phép theo dõi chuyển hướng
            })
                .then((response) => {
                    if (response.redirected) {
                        // Nếu server chuyển hướng, di chuyển người dùng tới URL mới
                        window.location.href = response.url;
                    } else if (response.ok) {
                        // Hiển thị thông báo thành công nếu không bị chuyển hướng
                        alert("Product added to cart!");
                    } else {
                        // Hiển thị thông báo lỗi nếu không thành công
                        alert("Failed to add product to cart.");
                    }
                })
                .catch((error) => {
                    console.error("Error adding product to cart:", error);
                    alert("An error occurred.");
                });
        });
    });
}

// Hàm xóa cart 
document.addEventListener("DOMContentLoaded", function () {
    // Attach event listener to the "Empty Cart" button
    const emptyCartButton = document.getElementById("empty-cart-btn");
    if (emptyCartButton) {
        emptyCartButton.addEventListener("click", function () {
            emptyCart();
        });
    }
});

async function emptyCart() {
    try {
        const response = await fetch("http://localhost:3000/user/cart/clear-product", {
            method: 'DELETE',
        });

        if (response.ok) {
            alert('Cart emptied successfully!');
            window.location.reload();  // Reload the page to reflect changes
        } else {
            const errorData = await response.json();
            alert(`Failed to empty cart: ${errorData.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error("Error emptying the cart:", error);
        alert("An error occurred while emptying the cart.");
    }
}

// Hàm hiển thị phân trang
function displayPagination(currentPage, totalPages) {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    // Nút "Previous"
    if (currentPage > 1) {
        const prevButton = document.createElement("button");
        prevButton.textContent = "Prev";
        prevButton.className = `w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary hover:text-white`;
        prevButton.onclick = () => fetchProducts(currentPage - 1);
        pagination.appendChild(prevButton);
    }

    const createPageButton = (page) => {
        const button = document.createElement("button");
        button.textContent = page;
        button.className = `w-10 h-10 flex items-center justify-center rounded-full ${
            page === currentPage
                ? "bg-primary text-white"
                : "hover:bg-primary hover:text-white"
        }`;
        button.onclick = () => fetchProducts(page);
        return button;
    };

    if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) {
            pagination.appendChild(createPageButton(i));
        }
    } else {
        pagination.appendChild(createPageButton(1));
        if (currentPage > 3)
            pagination.appendChild(document.createTextNode("..."));

        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        for (let i = start; i <= end; i++) {
            pagination.appendChild(createPageButton(i));
        }

        if (currentPage < totalPages - 2)
            pagination.appendChild(document.createTextNode("..."));
        pagination.appendChild(createPageButton(totalPages));
    }

    if (currentPage < totalPages) {
        const nextButton = document.createElement("button");
        nextButton.textContent = "Next";
        nextButton.className = `w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary hover:text-white`;
        nextButton.onclick = () => fetchProducts(currentPage + 1);
        pagination.appendChild(nextButton);
    }
}

// Hiển thị sản phẩm và phân trang
document.addEventListener("DOMContentLoaded", () => {
    // Bắt đầu tải trang đầu tiên
    fetchProducts(1);
});

/* cart */
document.addEventListener("DOMContentLoaded", function () {
    const cartIcon = document.querySelector(".cart-wrapper");
    const cartDropdown = cartIcon.querySelector(".group-hover\\:block");

    cartIcon.addEventListener("mouseenter", function () {
        clearTimeout(cartIcon.__timer);
        cartDropdown.classList.remove("hidden");
    });

    cartIcon.addEventListener("mouseleave", function () {
        cartIcon.__timer = setTimeout(() => {
            cartDropdown.classList.add("hidden");
        }, 1300);
    });

    cartDropdown.addEventListener("mouseenter", function () {
        clearTimeout(cartIcon.__timer);
    });

    cartDropdown.addEventListener("mouseleave", function () {
        cartIcon.__timer = setTimeout(() => {
            cartDropdown.classList.add("hidden");
        }, 1300);
    });
});

/* mobile menu */
document.addEventListener("DOMContentLoaded", function () {
    const hamburgerBtn = document.getElementById("hamburger");
    const mobileMenu = document.querySelector(".mobile-menu");

    hamburgerBtn.addEventListener("click", function () {
        mobileMenu.classList.toggle("hidden");
    });
});

/* swiper slider */
if (typeof Swiper !== "undefined") {
    var swiper = new Swiper(".swiper", {
        slidesPerView: 2,
        loop: true,
        autoplay: {
            delay: 3000,
        },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        breakpoints: {
            1024: {
                slidesPerView: 6,
            },
        },
    });

    var swiper = new Swiper(".main-slider", {
        slidesPerView: 1,
        loop: true,
        autoplay: {
            delay: 5000,
        },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
    });
}

// /* search icon show/hide */
// document.getElementById("search-icon").addEventListener("click", function () {
//     var searchField = document.getElementById("search-field");
//     if (searchField.classList.contains("hidden")) {
//         searchField.classList.remove("hidden");
//         searchField.classList.add("search-slide-down");
//     } else {
//         searchField.classList.add("hidden");
//         searchField.classList.remove("search-slide-down");
//     }
// });

function toggleDropdown(id, show) {
    const dropdown = document.getElementById(id);
    if (show) {
        dropdown.classList.remove("hidden");
    } else {
        dropdown.classList.add("hidden");
    }
}

function changeImage(element) {
    var mainImage = document.getElementById("main-image");
    mainImage.src = element.getAttribute("data-full");
}

/* single page product count */
document.addEventListener("DOMContentLoaded", function () {
    const decreaseButton = document.getElementById("decrease");
    const increaseButton = document.getElementById("increase");
    const quantityInput = document.getElementById("quantity");

    if (decreaseButton && increaseButton && quantityInput) {
        decreaseButton.addEventListener("click", function () {
            let quantity = parseInt(quantityInput.value);
            if (quantity > 1) {
                quantity -= 1;
                quantityInput.value = quantity;
            }
            updateButtons();
        });

        increaseButton.addEventListener("click", function () {
            let quantity = parseInt(quantityInput.value);
            quantity += 1;
            quantityInput.value = quantity;
            updateButtons();
        });

        function updateButtons() {
            if (parseInt(quantityInput.value) === 1) {
                decreaseButton.setAttribute("disabled", true);
            } else {
                decreaseButton.removeAttribute("disabled");
            }
        }
    }
});

/* single product tabs */
document.addEventListener("DOMContentLoaded", function () {
    const tabs = document.querySelectorAll(".tab");
    const contents = document.querySelectorAll(".tab-content");

    if (tabs.length > 0 && contents.length > 0) {
        tabs.forEach((tab) => {
            tab.addEventListener("click", function () {
                tabs.forEach((t) => {
                    t.classList.remove("active");
                    t.setAttribute("aria-selected", "false");
                });
                contents.forEach((c) => c.classList.add("hidden"));

                this.classList.add("active");
                this.setAttribute("aria-selected", "true");
                document
                    .querySelector(`#${this.id.replace("-tab", "-content")}`)
                    .classList.remove("hidden");
            });
        });

        tabs[0].click();
    }
});

/* shop page filter show/hide */
document.addEventListener("DOMContentLoaded", function () {
    const toggleButton = document.getElementById("products-toggle-filters");
    const filters = document.getElementById("filters");

    if (toggleButton && filters) {
        toggleButton.addEventListener("click", function () {
            if (filters.classList.contains("hidden")) {
                filters.classList.remove("hidden");
                this.textContent = "Hide Filters";
            } else {
                filters.classList.add("hidden");
                this.textContent = "Show Filters";
            }
        });
    }
});

/* shop page filter*/
document.addEventListener("DOMContentLoaded", function () {
    const selectElement = document.querySelector("select");
    const arrowDown = document.getElementById("arrow-down");
    const arrowUp = document.getElementById("arrow-up");

    if (selectElement && arrowDown && arrowUp) {
        selectElement.addEventListener("click", function () {
            arrowDown.classList.toggle("hidden");
            arrowUp.classList.toggle("hidden");
        });
    }
});

/* cart page */
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".cart-increment").forEach((button) => {
        button.addEventListener("click", function () {
            let quantityElement = this.previousElementSibling;
            let quantity = parseInt(quantityElement.textContent, 10);
            quantityElement.textContent = quantity + 1;
        });
    });

    document.querySelectorAll(".cart-decrement").forEach((button) => {
        button.addEventListener("click", function () {
            let quantityElement = this.nextElementSibling;
            let quantity = parseInt(quantityElement.textContent, 10);
            if (quantity > 1) {
                quantityElement.textContent = quantity - 1;
            }
        });
    });
});

// Ẩn dần thông báo của register/login
document.addEventListener("DOMContentLoaded", () => {
    const notification = document.getElementById("notification");

    if (notification) {
        // Đặt thời gian để tự động ẩn thông báo sau 2 giây
        setTimeout(() => {
            notification.classList.replace("opacity-100", "opacity-0"); // Mờ dần

            // Xóa thông báo khỏi DOM sau khi hiệu ứng mờ dần kết thúc
            setTimeout(() => {
                notification.remove();
            }, 1000); // Thời gian hiệu ứng mờ dần
        }, 2000); // Hiển thị trong 2 giây
    }
});

document
    .getElementById("write-review-link")
    .addEventListener("click", function (event) {
        event.preventDefault(); // Ngăn hành động mặc định của liên kết

        // Activate tab "Reviews"
        activateTab("reviews-tab", "reviews-content");

        // scroll to review form
        document.querySelector("#reviews-content").scrollIntoView({
            behavior: "smooth", // Hiệu ứng cuộn mượt
        });
    });

// Activate review tab and hiden the other
function activateTab(tabId, contentId) {
    // delete class 'active' and 'hidden'
    document.querySelectorAll("[role='tab']").forEach((tab) => {
        tab.classList.remove("active");
        tab.setAttribute("aria-selected", "false");
    });
    document.querySelectorAll(".tab-content").forEach((content) => {
        content.classList.add("hidden");
    });

    // Kích hoạt tab được chọn và hiển thị nội dung tương ứng
    document.getElementById(tabId).classList.add("active");
    document.getElementById(tabId).setAttribute("aria-selected", "true");
    document.getElementById(contentId).classList.remove("hidden");
}
