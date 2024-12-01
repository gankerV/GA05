// Hiển thị sản phẩm và phân trang
document.addEventListener("DOMContentLoaded", function () {
    const products = JSON.parse(
        document.getElementById("product-data").textContent,
    );

    // Cấu hình phân trang
    const itemsPerPage = 6;
    let currentPage = 1;

    // Hiển thị sản phẩm
    function displayProducts(page) {
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;

        const productList = document.getElementById("product-list");
        productList.innerHTML = "";

        products.slice(start, end).forEach((product) => {
            productList.innerHTML += `
            <div class="bg-white p-4 rounded-lg shadow">
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
                <button class="bg-primary border border-transparent hover:bg-transparent hover:border-primary text-white hover:text-primary font-semibold py-2 px-4 rounded-full w-full">
                    Add to Cart
                </button>
            </div>
        `;
        });
    }

    // Hiển thị phân trang
    function displayPagination() {
        const totalPages = Math.ceil(products.length / itemsPerPage);
        const pagination = document.getElementById("pagination");
        pagination.innerHTML = "";

        // Nút trang đầu tiên
        if (currentPage > 1) {
            const prevButton = document.createElement("button");
            prevButton.textContent = "Prev";
            prevButton.className = `w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary hover:text-white`;
            prevButton.onclick = () => {
                currentPage -= 1;
                displayProducts(currentPage);
                displayPagination();
            };
            pagination.appendChild(prevButton);
        }

        // Tạo danh sách trang
        const createPageButton = (page) => {
            const button = document.createElement("button");
            button.textContent = page;
            button.className = `w-10 h-10 flex items-center justify-center rounded-full ${
                page > 9 ? "ml-4" : "ml-1"
            } ${
                page === currentPage
                    ? "bg-primary text-white"
                    : "hover:bg-primary hover:text-white"
            }`;
            button.onclick = () => {
                currentPage = page;
                displayProducts(currentPage);
                displayPagination();
            };
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

        // Nút "Next"
        if (currentPage < totalPages) {
            const nextButton = document.createElement("button");
            nextButton.textContent = "Next";
            nextButton.className = `w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary hover:text-white ml-1`;
            nextButton.onclick = () => {
                currentPage += 1;
                displayProducts(currentPage);
                displayPagination();
            };
            pagination.appendChild(nextButton);
        }
    }

    // Khởi chạy
    displayProducts(currentPage);
    displayPagination();
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

function applyFilter(key, value, element) {
    const url = new URL(window.location.href);

    // Lấy danh sách các giá trị hiện tại
    let values = url.searchParams.getAll(key);

    if (values.includes(value)) {
        // Bỏ chọn filter
        values = values.filter((v) => v !== value);
        element.classList.remove("selected"); // Bỏ class khi không chọn
    } else {
        // Thêm filter
        values.push(value);
        element.classList.add("selected"); // Thêm class khi chọn
    }

    // Cập nhật lại query trong URL
    url.searchParams.delete(key); // Xóa key cũ
    values.forEach((v) => url.searchParams.append(key, v)); // Thêm các giá trị mới

    // Chuyển hướng đến URL mới
    window.location.href = url.toString();
}
