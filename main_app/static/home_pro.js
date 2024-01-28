document.addEventListener("DOMContentLoaded", () => {

    const productInfoModal = document.getElementById('productInfoModal')
    if (productInfoModal) {
        productInfoModal.addEventListener('show.bs.modal', event => {
            
            // Remove all created input in update_price modal
            const bulk_prices = document.getElementById("price_container");
            bulk_prices.querySelectorAll("input[name=bulk_prices").forEach(element => {
                if (element) {
                    element.parentElement.parentElement.parentElement.remove();
                }
            });
            const carton_price = document.getElementById("carton_bag_price");
            if (carton_price) {
                carton_price.parentElement.parentElement.parentElement.style.display == "none";
            }

            // Link that triggered the modal
            const link = event.relatedTarget
            
            // Extract info from data-* attributes
            const recipient = link.getAttribute('data-slug')

            // Set attribute data-slug to buttons for price and editing product
            const btnPrice = document.getElementById("priceCall");

            btnPrice.disabled = true;

            // Can use this to set dataset attribute instead
            btnPrice.setAttribute('data-slug', recipient);
            const cancel_price = document.getElementById("cancel_price");
            cancel_price.setAttribute('data-slug', recipient);

            const initiate_update = document.getElementById("initiate_update");
            initiate_update.setAttribute('data-slug', recipient);

            document.getElementById("minus_button").disabled = true;
            document.getElementById("plus_button").disabled = false;
            document.querySelector("#addToCart").disabled = true;
            document.getElementById("isWhole").checked = false;
            document.getElementById("isWhole").disabled = true;

            // const successful = document.getElementById("toastSuccess")
            // const successfulerToast = bootstrap.Toast.getOrCreateInstance(successful)
            const unSuccess = document.getElementById("toastError")
            const failToast = bootstrap.Toast.getOrCreateInstance(unSuccess)

            const editProd = document.getElementById("editCall");
            editProd.setAttribute("href", `/edit_product/${recipient}`)

            const modalTitle = productInfoModal.querySelector('.modal-title')

            // Fetch product's data from Django view
            fetch(`/find_product/${recipient}`)
            // Get response in json format
            .then((response) => {
                if (!response.ok) {
                    failToast.show();
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json()})
            // and then do the updating in a callback.
            .then(data => {
                const brand_name = data.brand_name
                const product_name = data.product_name
                const size = data.size
                const product_image = data.product_image
                const retail_price = data.retail_price
                const wholesale_price = data.wholesale_price
                const is_discount = data.is_discount
                const is_divisible = data.is_divisible
                const has_bulk = data.has_bulk
                // Can loop through bulk if needed
                const bulk = data.bulk
                const is_carton_bag = data.is_carton_bag
                const carton_bag_price = data.carton_bag_price
                const no_in_carton_bag = data.no_in_carton_bag
                const carton_bag_image = data.carton_bag_image
                const is_carton_bag_divisible = data.is_carton_bag_divisible
                const singles_stock = data.singles_stock
                const carton_bag_stock = data.carton_bag_stock

                modalTitle.textContent = `${brand_name} ${product_name}: ${size}`
                const existingPic = document.getElementById("centrePic")

                // Update pic for update+price_modal
                const update_pic = document.getElementById("update_pic")
                update_pic.src = product_image[0];
                update_pic.className = "rounded";
                update_pic.setAttribute("width", "150px");
                if (existingPic) {
                    existingPic.src = product_image[0]
                } else {
                    const picHold = document.getElementById("picHold")
                    const pic = document.createElement("img")

                    pic.src = product_image[0]
                    pic.setAttribute("width", "300px")
                    pic.id = "centrePic"
                    pic.className = "rounded"

                    picHold.append(pic)
                }
                document.getElementById("prodName").textContent = `${brand_name} ${product_name}: ${size}`
                document.getElementById("product_name").textContent = modalTitle.textContent;
                // Display price of selected sale type in bold font, with retail price being default
                const priceHold = document.getElementById("prodPrice")
                
                priceHold.textContent = `₦${editPrice(retail_price)}`
                document.getElementById("priceHold").value = retail_price;
                // Sale type: Pieces (Retail) | Pieces (Wholesale) | Dozen (12)
                // radio buttons - retail, wholesale (Single, add separator)
                const saleType = document.getElementById("saleType");
                saleType.textContent = "Pieces (Retail)";

                // Either disable or enable half and quarter buttons, but ensure they're unchecked
                const halfButton = document.getElementById("half_button");
                const quartButton = document.getElementById("quart_button");

                halfButton.checked = false;
                quartButton.checked = false;

                if (is_divisible === false) {
                    halfButton.disabled = true;
                    quartButton.disabled = true;
                }

                // Fetch cart data from Django
                fetch("/open_staff_carts")
                .then((response) => {
                    if (!response.ok) {
                        failToast.show();
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json()})
                .then(data => {
                    document.getElementById("noOfCustomers").value = data.carts.length
                    const dataList = document.createElement("datalist");
                    dataList.id = "cartList";
                    data.carts.forEach(element => {
                        // Compare with current options and skip if possible
                        const option = document.createElement("option");
                        option.value = element;
                        dataList.appendChild(option);
                    });
                    document.getElementById("custInfo").appendChild(dataList)
                })

                // Check if product is in any customer's list and display appropriate warning
                const sluger = document.getElementById("priceCall").dataset.slug;
                fetch(`/check_product_cart/${sluger}`)
                .then((response) => {
                    if (!response.ok) {
                        failToast.show();
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json()})
                .then(data => {
                    const result = data.result
                    // Create alert
                    const cartWarning = document.getElementById("prodExists");
                    const wrapper = document.createElement("div");
                    wrapper.id = "alertNotice";

                    wrapper.innerHTML = [
                        '<div class="alert alert-warning d-flex align-items-center alert-dismissible" role="alert">',
                        '   <svg class="bi flex-shrink-0 me-2" width="16" height="16" role="img" aria-label="Warning:"><use xlink:href="#exclamation-triangle-fill"/></svg>',
                        '   <div>',
                        '       This product is already in a customer\'s cart.',
                        '       <br> Attempting to add it again will update/replace it in the customer\'s cart.',
                        '   </div>',
                        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" id="close_alert"></button>',
                        '</div>'
                      ].join('')

                    if (result === true) {
                        cartWarning.append(wrapper)
                    }
                })

                // place buttons for singles (retail and wholesale) in div,
                // with the other bulk and carton buttons in a separate div together
                // can use flex to put them together responsively
                const buttonHome = document.getElementById("buttonHolder");
                const saleIdent = document.getElementById("saleID")
                const singDiv = document.getElementById("singDiv");

                // Set value of retail_price and wholesale_price of update_modal
                document.getElementById("retail_price").value = retail_price;
                document.getElementById("wholesale_price").value = wholesale_price;

                if (singDiv) {
                    const retailButton = document.getElementById("retailbutton");
                    retailButton.checked = true;
                    retailButton.dataset.price = retail_price;
                    retailButton.dataset.image = product_image[0];
                    retailButton.dataset.divisibility = is_divisible.toString();

                    const wholesaleButton = document.getElementById("wholesalebutton");
                    wholesaleButton.dataset.price = wholesale_price;
                    wholesaleButton.dataset.image = product_image[0];
                    wholesaleButton.dataset.divisibility = is_divisible.toString();
                    const discount_button = document.getElementById("discountSwitch");
                    if (discount_button) {
                        if (is_discount) {
                            discount_button.style.display = "block";
                        } else {
                            discount_button.style.display = "none";
                        }
                    } else {
                        if (is_discount) {
                            const discountDiv = document.createElement("div");
                            discountDiv.className = "form-check form-switch";
                            discountDiv.id = "discounting";
                            
                            const discountButton = document.createElement("input");
                            discountButton.type = "checkbox";
                            discountButton.id = "discountSwitch";
                            discountButton.className = "form-check-input";
                            discountButton.setAttribute("role", "switch");

                            const discountLabel = document.createElement("label");
                            discountLabel.appendChild(document.createTextNode("Discount the Retail Price"));
                            discountLabel.className = "form-check-label text-light"
                            discountLabel.setAttribute("for", discountButton.id);

                            discountDiv.appendChild(discountLabel);
                            discountDiv.appendChild(discountButton);
                            saleIdent.append(discountDiv);
                        }
                    }
                    
                } else {
                    if (is_discount) {
                        const discountDiv = document.createElement("div");
                        discountDiv.className = "form-check form-switch";
                        discountDiv.id = "discounting";
                        
                        const discountButton = document.createElement("input");
                        discountButton.type = "checkbox";
                        discountButton.id = "discountSwitch";
                        discountButton.className = "form-check-input";
                        discountButton.setAttribute("role", "switch");

                        const discountLabel = document.createElement("label");
                        discountLabel.appendChild(document.createTextNode("Discount the Retail Price"));
                        discountLabel.className = "form-check-label text-light"
                        discountLabel.setAttribute("for", discountButton.id);

                        discountDiv.appendChild(discountLabel);
                        discountDiv.appendChild(discountButton);
                        saleIdent.append(discountDiv);
                    }
                    
                    const newSingDiv = document.createElement("div");
                    newSingDiv.id = "singDiv";
                    newSingDiv.className = "me-2";

                    const singText = document.createElement("h6");
                    singText.textContent = "Pieces";
                    singText.className = "text-light";

                    newSingDiv.append(singText);

                    // Create button for retail
                    const retailButton = document.createElement("input");
                    retailButton.type = "radio";
                    retailButton.className = "btn-check";
                    retailButton.name = "saleType";
                    retailButton.checked = true;
                    retailButton.autocomplete = "off";
                    retailButton.id = "retailbutton";
                    retailButton.dataset.price = retail_price;
                    retailButton.value = "Pieces (Retail)";
                    retailButton.dataset.truesale = "retail_price";
                    retailButton.dataset.image = product_image[0];
                    retailButton.dataset.number = "1"
                    retailButton.dataset.divisibility = is_divisible.toString();

                    // Create label for retail button
                    let l = document.createElement("LABEL");
                    let m = document.createTextNode("Retail");
                    l.setAttribute("for", retailButton.id);
                    l.appendChild(m);
                    l.className = "btn btn-outline-light me-2";

                    newSingDiv.appendChild(retailButton);
                    newSingDiv.appendChild(l);

                    // Create button for wholesale
                    const wholesaleButton = document.createElement("input");
                    wholesaleButton.type = "radio";
                    wholesaleButton.className = "btn-check";
                    wholesaleButton.name = "saleType";
                    wholesaleButton.autocomplete = "off";
                    wholesaleButton.id = "wholesalebutton";
                    wholesaleButton.dataset.price = wholesale_price;
                    wholesaleButton.value = "Pieces (Wholesale)";
                    wholesaleButton.dataset.truesale = "wholesale_price";
                    wholesaleButton.dataset.image = product_image[0];
                    wholesaleButton.dataset.number = "1"
                    wholesaleButton.dataset.divisibility = is_divisible.toString();

                    // Create label for wholesale button
                    let n = document.createElement("LABEL");
                    let o = document.createTextNode("Wholesale");
                    n.setAttribute("for", wholesaleButton.id);
                    n.appendChild(o);
                    n.className = "btn btn-outline-light";

                    newSingDiv.appendChild(wholesaleButton);
                    newSingDiv.appendChild(n);
                    buttonHome.append(newSingDiv);
                }
                
                const newBulkDiv = document.createElement("div");
                newBulkDiv.id = "bulkDiv";

                const bulkText = document.createElement("h6");
                bulkText.textContent = "Bulk";
                bulkText.className = "text-light";
                
                const vRule = document.createElement("div");
                vRule.className = "vr me-2 d-none d-md-block d-lg-block d-xl-block d-xxl-block";
                vRule.style.color = "white";
                vRule.id = "Separ";

                const holder = document.getElementById("quantleft");
                var totalQuantity = (no_in_carton_bag * carton_bag_stock) + singles_stock;
                holder.value = totalQuantity;
                const all_prices = document.getElementById("price_container");
                if (has_bulk) {
                    
                    buttonHome.append(vRule);

                    newBulkDiv.append(bulkText);
                    bulk.forEach(item => {
                        // Extract value of key to assign to dataset
                        const element = item["bulk_type"];

                        // Create button per bulk item
                        const bulkButton = document.createElement("input");
                        bulkButton.type = "radio";
                        bulkButton.className = "btn-check bulk";
                        bulkButton.name = "saleType";
                        bulkButton.autocomplete = "off";
                        bulkButton.id = element;
                        
                        // Get num of items in bulk item
                        bulkButton.dataset.number = item["no_in_bulk"];

                        // Get price of bulk
                        bulkButton.dataset.price = item["bulk_price"];

                        // Get image of bulk
                        bulkButton.dataset.image = item["bulk_image"][0];

                        bulkButton.value = `${element} (${item["no_in_bulk"]})`
                        bulkButton.dataset.truesale = `${element}`
                        
                        // Test this whenever possible
                        if (parseInt(bulkButton.dataset.number) > totalQuantity) {
                            bulkButton.disabled = true;
                        }

                        // Create label for button
                        const am = document.createElement("label");
                        const pm = document.createTextNode(element)
                        am.setAttribute("for", bulkButton.id);
                        am.appendChild(pm);
                        am.className = "btn btn-outline-light me-2";

                        newBulkDiv.append(bulkButton);
                        newBulkDiv.append(am);

                        // Create HTML elements per bulk
                        const over_div = document.createElement("div");
                        over_div.className = "row g-3 mb-2"
                        
                        // For the label
                        const label_div = document.createElement("div");
                        label_div.className = "col-auto";
                        const bulk_label = document.createElement("label");
                        bulk_label.className = "col-form-label";
                        const label_text = document.createTextNode(`${element} Price:`)
                        bulk_label.setAttribute("for", `${element}_price`);
                        bulk_label.append(label_text)

                        label_div.appendChild(bulk_label);
                        over_div.appendChild(label_div);

                        // For the input itself
                        const input_over_div = document.createElement("div");
                        input_over_div.className = "col-auto";

                        const input_div = document.createElement("div");
                        input_div.className = "input-group";
                        const input_span = document.createElement("span");
                        input_span.textContent = "₦"
                        input_span.className = "input-group-text"

                        const input_bulk_price = document.createElement("input");
                        input_bulk_price.id = `${element}_price`;
                        input_bulk_price.setAttribute("data-type", element);
                        input_bulk_price.className = "form-control";
                        input_bulk_price.type = "number";
                        input_bulk_price.autocomplete = "off";
                        input_bulk_price.placeholder = "0.00";
                        input_bulk_price.name = "bulk_prices";
                        input_bulk_price.value = item["bulk_price"];

                        input_div.appendChild(input_span);
                        input_div.appendChild(input_bulk_price);
                        input_over_div.appendChild(input_div);

                        over_div.appendChild(input_over_div);
                        const cart_position = document.getElementById("carton_bag_price").parentElement.parentElement.parentElement
                        all_prices.insertBefore(over_div, cart_position);

                    });
                }
                
                if (is_carton_bag != "none") {
                    if (has_bulk == false) {
                        buttonHome.append(vRule);
                        newBulkDiv.append(bulkText);
                    }
                    const cartButton = document.createElement("input");
                    cartButton.type = "radio";
                    cartButton.className = "btn-check bulk";
                    cartButton.name = "saleType";
                    cartButton.autocomplete = "off";
                    cartButton.id = "cartButton";
                    cartButton.dataset.price = carton_bag_price;
                    cartButton.dataset.number = no_in_carton_bag;
                    cartButton.dataset.image = carton_bag_image[0];
                    cartButton.dataset.stock = carton_bag_stock
                    cartButton.dataset.divisibility = is_carton_bag_divisible.toString()

                    if (parseInt(cartButton.dataset.number) > totalQuantity) {
                        cartButton.disabled = true;
                    }

                    // Create label for button
                    if (is_carton_bag == "carton") {
                        var element = "Carton";
                    } else {
                        element = "Bag";
                    }
                    const y = document.createElement("label");
                    const z = document.createTextNode(element)
                    cartButton.value = element;
                    cartButton.dataset.truesale = "carton_bag_price"
                    y.setAttribute("for", cartButton.id);
                    y.appendChild(z);
                    y.className = "btn btn-outline-light me-2";

                    newBulkDiv.append(cartButton);
                    newBulkDiv.append(y);

                    const over_div = document.createElement("div");
                    over_div.className = "row g-3 mb-2"
                    
                    // For the label
                    const carton_label = document.getElementById("carton_label");
                    if (element == "Bag") {
                        carton_label.textContent = element
                    }
                   

                    // For the input itself
                    const cart_input = document.getElementById("carton_bag_price");
                    cart_input.value = carton_bag_price;

                    cart_input.parentElement.parentElement.parentElement.style.display == "block";
                }

                buttonHome.append(newBulkDiv);
                
                // Quantity
                // make use of display: none here, with if quantity is 1,
                // pressing the minus button will hide the textbox and make a 1/2 text visible
                // again will make 1/4 text visible
                // const quantHold = 
                const quantLeft = document.getElementById("quantityLeft");
                if (totalQuantity < 10) {
                    quantLeft.textContent = `Only ${totalQuantity} left`;
                } else {
                    quantLeft.textContent = `${totalQuantity} available`;
                }
                document.getElementById("ze_spinner").style.display = "none";
                document.getElementById("product_content").style.display = "block";
                document.getElementById("productInfoModalLabel").style.visibility = "visible";
                btnPrice.disabled = false;
            })
            .catch(error => {
                failToast.show();
                console.error({"error": error});
            });
        })
        
        document.addEventListener("click", event => {
            const element = event.target;
            const halfButton = document.getElementById("half_button");
            const quartButton = document.getElementById("quart_button");
            const quantity = document.getElementById("prodquantity");
            const totalQuant = document.getElementById("totalQuantity");
            const isWhole = document.getElementById("isWhole");
            
            // Make changes to information shown in dialog
            if (element.name == "saleType") {
                quantity.value = 1;
                totalQuant.textContent = 1;
                halfButton.checked = false;
                quartButton.checked = false;
                isWhole.checked = false;
                document.getElementById("plus_button").disabled = false;
                quantity.disabled = false;
                // console.log(`Before change: ${document.getElementById("priceHold").value}`);

                // Disable quantity buttons if not feasible, set quantity to value: 1
                if (element.dataset.divisibility == "false") {
                    // For isWhole, check that it's available. Select half if selected
                    if (totalQuantity) {
                        
                    }
                    isWhole.disabled = true;
                    halfButton.disabled = true;
                    quartButton.disabled = true;
                    document.getElementById("minus_button").disabled = true;
                    document.getElementById("plus_button").disabled = false;
                } else {
                    isWhole.disabled = false;
                    halfButton.disabled = false;
                    quartButton.disabled = false;
                    document.getElementById("minus_button").disabled = true;
                    document.getElementById("plus_button").disabled = false;
                }

                if ((parseInt(element.dataset.number) % 2) != 0) {
                    halfButton.disabled = true;
                }
                if ((parseInt(element.dataset.number) % 4) != 0) {
                    quartButton.disabled = true;
                }

                // Cartons have rules that bind them and only them
                if (parseInt(element.dataset.stock) == 1) {
                    document.getElementById("plus_button").disabled = true;
                    var remainder = parseInt(document.getElementById("quantleft").value) - (parseInt(element.dataset.number) * parseInt(element.dataset.stock))
                    if (remainder < Math.floor(parseInt(element.dataset.number) / 4)) {
                        quartButton.checked = false;
                        quartButton.disabled = true;
                    } else if (remainder > Math.floor(parseInt(element.dataset.number) / 4) && remainder < Math.floor(parseInt(element.dataset.number) / 2) && element.dataset.divisibility != "false") {
                        quartButton.checked = false;
                        quartButton.disabled = false;
                        halfButton.checked = false;
                        halfButton.disabled = true;
                    } else if (remainder < Math.floor(parseInt(element.dataset.number) / 2)) {
                        halfButton.checked = false;
                        halfButton.disabled = true;
                        quartButton.checked = false;
                        quartButton.disabled = true;
                    } else if (element.dataset.divisibility == "false") {
                        halfButton.checked = false;
                        halfButton.disabled = true;
                        quartButton.checked = false;
                        quartButton.disabled = true;
                    } else {
                        halfButton.disabled = false;
                        quartButton.disabled = false;
                    }
                }
                
                // Update image from selected button
                const thePic = document.getElementById("centrePic");
                thePic.src = element.dataset.image;

                // update sale information
                const saleType = document.getElementById("saleType");
                saleType.textContent = `${element.value}`;

                // update price info
                const priceHold = document.getElementById("prodPrice");
                priceHold.textContent = `₦${editPrice(element.dataset.price)}`;
                document.getElementById("priceHold").value = element.dataset.price;
                // console.log(`After change: ${document.getElementById("priceHold").value}`);

                const quantLeft = document.getElementById("quantityLeft");
                if (element.id == "cartButton") {
                    if (parseInt(element.dataset.stock) < 10) {
                        quantLeft.textContent = `Only ${element.dataset.stock} left`;
                    } else {
                        quantLeft.textContent = `${element.dataset.stock} available`;
                    }
                } else {
                    var totalQuantity = document.getElementById("quantleft").value;
                    if (totalQuantity < 10) {
                        quantLeft.textContent = `Only ${totalQuantity} left`;
                    } else {
                        quantLeft.textContent = `${totalQuantity} available`;
                    }
                }               
            
            // button is the plus button increasing quantity of goods to buy
            } else if (element.id == "plus_button") {
                quantity.value = parseInt(quantity.value) + 1;
                const currSaleType = document.querySelector("input[name=saleType]:checked");
                if (currSaleType.value == "Pieces (Retail)") {
                    if (parseInt(quantity.value) < 1) {
                        quantity.value = 1;
                        document.getElementById("minus_button").disabled = true;
                        document.getElementById("plus_button").disabled = false;
                    } else if (parseInt(quantity.value) >= parseInt(document.getElementById("quantleft").value)) {
                        quantity.value = document.getElementById("quantleft").value;
                        document.getElementById("minus_button").disabled = false;
                        document.getElementById("plus_button").disabled = true;
                    } else {
                        quantity.value = parseInt(quantity.value);
                        document.getElementById("minus_button").disabled = false;
                        document.getElementById("plus_button").disabled = false;
                    }
                } else if (currSaleType.value == "Pieces (Wholesale)") {
                    if (parseInt(quantity.value) < 1) {
                        quantity.value = 1;
                        document.getElementById("minus_button").disabled = true;
                        document.getElementById("plus_button").disabled = false;
                    } else if (parseInt(quantity.value) >= parseInt(document.getElementById("quantleft").value)) {
                        quantity.value = document.getElementById("quantleft").value;
                        document.getElementById("minus_button").disabled = false;
                        document.getElementById("plus_button").disabled = true;
                    } else {
                        quantity.value = parseInt(quantity.value);
                        document.getElementById("minus_button").disabled = false;
                        document.getElementById("plus_button").disabled = false;
                    }
                } else if (currSaleType.value == "Carton" || currSaleType.value == "Bag") {
                    if (parseInt(quantity.value) < 1) {
                        quantity.value = 1;
                        document.getElementById("minus_button").disabled = true;
                        document.getElementById("plus_button").disabled = false;
                    } else if (parseInt(quantity.value) >= parseInt(currSaleType.dataset.stock)) {
                        quantity.value = currSaleType.dataset.stock;
                        var remainder = parseInt(document.getElementById("quantleft").value) - (parseInt(currSaleType.dataset.number) * parseInt(currSaleType.dataset.stock))
                        if (remainder < Math.floor(parseInt(currSaleType.dataset.number) / 4)) {
                            quartButton.checked = false;
                            quartButton.disabled = true;
                        } else if (remainder > Math.floor(parseInt(currSaleType.dataset.number) / 4) && remainder < Math.floor(parseInt(currSaleType.dataset.number) / 2) && currSaleType.dataset.divisibility != "false") {
                            quartButton.disabled = false;
                            halfButton.checked = false;
                            halfButton.disabled = true;
                        } else if (remainder < Math.floor(parseInt(currSaleType.dataset.number) / 2)) {
                            halfButton.checked = false;
                            halfButton.disabled = true;
                            quartButton.checked = false;
                            quartButton.disabled = true;
                        } else if (currSaleType.dataset.divisibility == "false") {
                            halfButton.checked = false;
                            halfButton.disabled = true;
                            quartButton.checked = false;
                            quartButton.disabled = true;
                        } else {
                            if ((parseInt(currSaleType.dataset.number) % 4) != 0) {
                                halfButton.checked = false;
                                quartButton.disabled = true;
                                quartButton.checked = false;
                                halfButton.disabled = false;
                            } else if ((parseInt(currSaleType.dataset.number) % 2) != 0) {
                                halfButton.checked = false;
                                halfButton.disabled = true;
                                quartButton.checked = false;
                                quartButton.disabled = true;
                            } else {
                                halfButton.checked = false;
                                halfButton.disabled = false;
                                quartButton.checked = false;
                                quartButton.disabled = false;
                            }
                        }
                        document.getElementById("minus_button").disabled = false;
                        document.getElementById("plus_button").disabled = true;
                    } else {
                        quantity.value = parseInt(quantity.value);
                        document.getElementById("minus_button").disabled = false;
                        document.getElementById("plus_button").disabled = false;
                        var remainder = parseInt(document.getElementById("quantleft").value) - (parseInt(element.dataset.number) * parseInt(element.dataset.stock))
                        if (remainder < Math.floor(parseInt(element.dataset.number) / 4)) {
                            quartButton.checked = false;
                            quartButton.disabled = true;
                        } else if (remainder > Math.floor(parseInt(element.dataset.number) / 4) && remainder < Math.floor(parseInt(element.dataset.number) / 2) && element.dataset.divisibility != "false") {
                            quartButton.disabled = false;
                            halfButton.checked = false;
                            halfButton.disabled = true;
                        } else if (remainder < Math.floor(parseInt(element.dataset.number) / 2)) {
                            halfButton.checked = false;
                            halfButton.disabled = true;
                            quartButton.checked = false;
                            quartButton.disabled = true;
                        } else if (element.dataset.divisibility == "false") {
                            halfButton.checked = false;
                            halfButton.disabled = true;
                            quartButton.checked = false;
                            quartButton.disabled = true;
                        } else {
                            halfButton.disabled = false;
                            quartButton.disabled = false;
                        }
                    }
                } else {
                    if (parseInt(quantity.value) < 1) {
                        quantity.value = 1;
                        document.getElementById("minus_button").disabled = true;
                        document.getElementById("plus_button").disabled = false;
                    } else if (((parseInt(quantity.value) + 1) * parseInt(currSaleType.dataset.number)) >= parseInt(document.getElementById("quantleft").value)) {
                        document.getElementById("plus_button").disabled = true;
                        // Getting a headache here
                        var allowQuant = Math.floor(parseInt(document.getElementById("quantleft").value)/parseInt(currSaleType.dataset.number))
                        quantity.value = allowQuant;
                        var remainder = parseInt(document.getElementById("quantleft").value) - (parseInt(currSaleType.dataset.number) * parseInt(quantity.value))
                        if ((remainder < (Math.floor(parseInt(currSaleType.dataset.number) / 4) + Math.floor(parseInt(currSaleType.dataset.number) / 2))) && ((parseInt(currSaleType.dataset.number) % 4) == 0) && ((parseInt(currSaleType.dataset.number) % 2) == 0)) {
                            halfButton.checked = false;
                            quartButton.checked = false;
                        } else if (remainder < Math.floor(parseInt(currSaleType.dataset.number) / 4)) {
                            quartButton.checked = false;
                            quartButton.disabled = true;
                        } else if (remainder < Math.floor(parseInt(currSaleType.dataset.number) / 2)) {
                            halfButton.checked = false;
                            halfButton.disabled = true;
                            quartButton.checked = false;
                            quartButton.disabled = true;
                        } else {
                            if ((parseInt(currSaleType.dataset.number) % 4) != 0) {
                                quartButton.disabled = true;
                                quartButton.checked = false;
                                halfButton.disabled = false;
                            } else if ((parseInt(currSaleType.dataset.number) % 2) != 0) {
                                halfButton.checked = false;
                                halfButton.disabled = true;
                                quartButton.checked = false;
                                quartButton.disabled = true;
                            } else {
                                halfButton.disabled = false;
                                quartButton.disabled = false;
                            }
                        }
                        document.getElementById("minus_button").disabled = false;
                    } else {
                        quantity.value = parseInt(quantity.value);
                        document.getElementById("minus_button").disabled = false;
                        document.getElementById("plus_button").disabled = false;
                    }
                }
                // if (parseInt(quantity.value) > 1) {
                //     document.getElementById("minus_button").disabled = false;
                // }
                if (halfButton.checked && quartButton.checked) {
                    totalQuant.textContent = `${quantity.value} and three quarters (¾)`
                } else if (quartButton.checked) {
                    totalQuant.textContent = `${quantity.value} and a quarter (¼)`
                } else if (halfButton.checked) {
                    totalQuant.textContent = `${quantity.value} and a half (½)`
                } else {
                    totalQuant.textContent = `${quantity.value}`
                }

            // button is the minus button decreasing quantity of goods to buy
            } else if (element.id == "minus_button") {
                quantity.value = parseInt(quantity.value) - 1;
                const currSaleType = document.querySelector("input[name=saleType]:checked");
                if (currSaleType.value == "Pieces (Retail)") {
                    if (parseInt(quantity.value) <= 1) {
                        quantity.value = 1;
                        document.getElementById("minus_button").disabled = true;
                        document.getElementById("plus_button").disabled = false;
                    } else if (parseInt(quantity.value) >= parseInt(document.getElementById("quantleft").value)) {
                        quantity.value = document.getElementById("quantleft").value;
                        document.getElementById("minus_button").disabled = false;
                        document.getElementById("plus_button").disabled = true;
                    } else {
                        quantity.value = parseInt(quantity.value);
                        document.getElementById("minus_button").disabled = false;
                        document.getElementById("plus_button").disabled = false;
                    }
                } else if (currSaleType.value == "Pieces (Wholesale)") {
                    if (parseInt(quantity.value) <= 1) {
                        quantity.value = 1;
                        document.getElementById("minus_button").disabled = true;
                        document.getElementById("plus_button").disabled = false;
                    } else if (parseInt(quantity.value) >= parseInt(document.getElementById("quantleft").value)) {
                        quantity.value = document.getElementById("quantleft").value;
                        document.getElementById("minus_button").disabled = false;
                        document.getElementById("plus_button").disabled = true;
                    } else {
                        quantity.value = parseInt(quantity.value);
                        document.getElementById("minus_button").disabled = false;
                        document.getElementById("plus_button").disabled = false;
                    }
                } else if (currSaleType.value == "Carton" || currSaleType.value == "Bag") {
                    if (parseInt(quantity.value) <= 1) {
                        quantity.value = 1;
                        document.getElementById("minus_button").disabled = true;
                        document.getElementById("plus_button").disabled = false;
                    } else if (parseInt(quantity.value) >= parseInt(currSaleType.dataset.stock)) {
                        quantity.value = currSaleType.dataset.stock;
                        var remainder = parseInt(document.getElementById("quantleft").value) - (parseInt(currSaleType.dataset.number) * parseInt(currSaleType.dataset.stock))
                        if (remainder < Math.floor(parseInt(currSaleType.dataset.number) / 4)) {
                            quartButton.checked = false;
                            quartButton.disabled = true;
                        } else if (remainder > Math.floor(parseInt(currSaleType.dataset.number) / 4) && remainder < Math.floor(parseInt(currSaleType.dataset.number) / 2) && currSaleType.dataset.divisibility != "false") {
                            quartButton.disabled = false;
                            halfButton.checked = false;
                            halfButton.disabled = true;
                        } else if (remainder < Math.floor(parseInt(currSaleType.dataset.number) / 2)) {
                            halfButton.checked = false;
                            halfButton.disabled = true;
                            quartButton.checked = false;
                            quartButton.disabled = true;
                        } else if (currSaleType.dataset.divisibility == "false") {
                            halfButton.checked = false;
                            halfButton.disabled = true;
                            quartButton.checked = false;
                            quartButton.disabled = true;
                        } else {
                            if ((parseInt(currSaleType.dataset.number) % 4) != 0) {
                                quartButton.disabled = true;
                                quartButton.checked = false;
                                halfButton.disabled = false;
                            } else if ((parseInt(currSaleType.dataset.number) % 2) != 0) {
                                halfButton.checked = false;
                                halfButton.disabled = true;
                                quartButton.checked = false;
                                quartButton.disabled = true;
                            } else {
                                halfButton.disabled = false;
                                quartButton.disabled = false;
                            }
                        }
                        document.getElementById("minus_button").disabled = false;
                        document.getElementById("plus_button").disabled = true;
                    } else {
                        quantity.value = parseInt(quantity.value);
                        document.getElementById("minus_button").disabled = false;
                        document.getElementById("plus_button").disabled = false;
                        var remainder = parseInt(document.getElementById("quantleft").value) - (parseInt(element.dataset.number) * parseInt(element.dataset.stock))
                        if (remainder < Math.floor(parseInt(element.dataset.number) / 4)) {
                            quartButton.checked = false;
                            quartButton.disabled = true;
                        } else if (remainder > Math.floor(parseInt(element.dataset.number) / 4) && remainder < Math.floor(parseInt(element.dataset.number) / 2) && element.dataset.divisibility != "false") {
                            quartButton.disabled = false;
                            halfButton.checked = false;
                            halfButton.disabled = true;
                        } else if (remainder < Math.floor(parseInt(element.dataset.number) / 2)) {
                            halfButton.checked = false;
                            halfButton.disabled = true;
                            quartButton.checked = false;
                            quartButton.disabled = true;
                        } else if (element.dataset.divisibility == "false") {
                            halfButton.checked = false;
                            halfButton.disabled = true;
                            quartButton.checked = false;
                            quartButton.disabled = true;
                        } else {
                            halfButton.disabled = false;
                            quartButton.disabled = false;
                        }
                    }
                } else {
                    if (parseInt(quantity.value) <= 1) {
                        quantity.value = 1;
                        var remainder = parseInt(document.getElementById("quantleft").value) - (parseInt(currSaleType.dataset.number) * parseInt(quantity.value))
                        if ((remainder > (Math.floor(parseInt(currSaleType.dataset.number) / 4) + Math.floor(parseInt(currSaleType.dataset.number) / 2))) && ((parseInt(currSaleType.dataset.number) % 4) == 0) && ((parseInt(currSaleType.dataset.number) % 2) == 0)) {
                            halfButton.disabled = false;
                            quartButton.disabled = false;
                        } else if (remainder < Math.floor(parseInt(currSaleType.dataset.number) / 4)) {
                            quartButton.checked = false;
                            quartButton.disabled = true;
                        } else if (remainder < Math.floor(parseInt(currSaleType.dataset.number) / 2)) {
                            halfButton.checked = false;
                            halfButton.disabled = true;
                            quartButton.checked = false;
                            quartButton.disabled = true;
                        } else {
                            if ((parseInt(currSaleType.dataset.number) % 4) != 0) {
                                quartButton.disabled = true;
                                quartButton.checked = false;
                                halfButton.disabled = false;
                            } else if ((parseInt(currSaleType.dataset.number) % 2) != 0) {
                                halfButton.checked = false;
                                halfButton.disabled = true;
                                quartButton.checked = false;
                                quartButton.disabled = true;
                            } else {
                                halfButton.disabled = false;
                                quartButton.disabled = false;
                            }
                        }
                        document.getElementById("minus_button").disabled = true;
                        document.getElementById("plus_button").disabled = false;
                    } else if (((parseInt(quantity.value)) * parseInt(currSaleType.dataset.number)) >= parseInt(document.getElementById("quantleft").value)) {
                        document.getElementById("plus_button").disabled = true;
                        // Getting a headache here
                        var allowQuant = Math.floor(parseInt(document.getElementById("quantleft").value)/parseInt(currSaleType.dataset.number))
                        quantity.value = allowQuant;
                        var remainder = parseInt(document.getElementById("quantleft").value) - (parseInt(currSaleType.dataset.number) * parseInt(quantity.value))
                        if (remainder < Math.floor(parseInt(currSaleType.dataset.number) / 4)) {
                            quartButton.checked = false;
                            quartButton.disabled = true;
                        } else if (remainder < Math.floor(parseInt(currSaleType.dataset.number) / 2)) {
                            halfButton.checked = false;
                            halfButton.disabled = true;
                            quartButton.checked = false;
                            quartButton.disabled = true;
                        } else {
                            if ((parseInt(currSaleType.dataset.number) % 4) != 0) {
                                quartButton.disabled = true;
                                quartButton.checked = false;
                                halfButton.disabled = false;
                            } else if ((parseInt(currSaleType.dataset.number) % 2) != 0) {
                                halfButton.checked = false;
                                halfButton.disabled = true;
                                quartButton.checked = false;
                                quartButton.disabled = true;
                            } else {
                                halfButton.disabled = false;
                                quartButton.disabled = false;
                            }                            
                        }
                        document.getElementById("minus_button").disabled = false;
                    } else {
                        quantity.value = parseInt(quantity.value);
                        var remainder = parseInt(document.getElementById("quantleft").value) - (parseInt(currSaleType.dataset.number) * parseInt(quantity.value))
                        if ((remainder > (Math.floor(parseInt(currSaleType.dataset.number) / 4) + Math.floor(parseInt(currSaleType.dataset.number) / 2))) && ((parseInt(currSaleType.dataset.number) % 4) == 0) && ((parseInt(currSaleType.dataset.number) % 2) == 0)) {
                            halfButton.disabled = false;
                            quartButton.disabled = false;
                        } else if (remainder < Math.floor(parseInt(currSaleType.dataset.number) / 4)) {
                            quartButton.checked = false;
                            quartButton.disabled = true;
                        } else if (remainder < Math.floor(parseInt(currSaleType.dataset.number) / 2)) {
                            halfButton.checked = false;
                            halfButton.disabled = true;
                            quartButton.checked = false;
                            quartButton.disabled = true;
                        } else {
                            if ((parseInt(currSaleType.dataset.number) % 4) != 0) {
                                quartButton.disabled = true;
                                quartButton.checked = false;
                                halfButton.disabled = false;
                            } else if ((parseInt(currSaleType.dataset.number) % 2) != 0) {
                                halfButton.checked = false;
                                halfButton.disabled = true;
                                quartButton.checked = false;
                                quartButton.disabled = true;
                            } else {
                                halfButton.disabled = false;
                                quartButton.disabled = false;
                            }
                        }
                        document.getElementById("minus_button").disabled = false;
                        document.getElementById("plus_button").disabled = false;
                    }
                }
                // if (parseInt(quantity.value) >= 1) {
                //     document.getElementById("plus_button").disabled = false;
                //     if (parseInt(quantity.value) == 1) {
                //         document.getElementById("minus_button").disabled = true;
                //         if (halfButton.checked && quartButton.checked) {
                //             totalQuant.textContent = `${quantity.value} and three quarters (¾)`
                //         } else if (quartButton.checked) {
                //             totalQuant.textContent = `${quantity.value} and a quarter (¼)`
                //         } else if (halfButton.checked) {
                //             totalQuant.textContent = `${quantity.value} and a half (½)`
                //         } else {
                //             totalQuant.textContent = `${quantity.value}`
                //         }
                //         return;
                //     }
                //     document.getElementById("minus_button").disabled = false;
                // }
                if (halfButton.checked && quartButton.checked) {
                    totalQuant.textContent = `${quantity.value} and three quarters (¾)`
                } else if (quartButton.checked) {
                    totalQuant.textContent = `${quantity.value} and a quarter (¼)`
                } else if (halfButton.checked) {
                    totalQuant.textContent = `${quantity.value} and a half (½)`
                } else {
                    totalQuant.textContent = `${quantity.value}`
                }
            
            } else if (element.id == "half_button") {
                // button is the half button increasing quantity of goods by half
                if (element.checked == true) {
                    // alert("True");
                    // Customer wants half, or half as well
                    const currSaleType = document.querySelector("input[name=saleType]:checked");
                    if (isWhole.checked == false) {
                        remainder = parseInt(document.getElementById("quantleft").value) - (parseInt(quantity.value) * parseInt(currSaleType.dataset.number))
                        if (remainder >= (parseInt(currSaleType.dataset.number) / 2)) {
                            // There's probably enough to supply quarter more
                            var quest = remainder - (parseInt(currSaleType.dataset.number) / 2);

                            // Only possible if number is divisible by 4
                            if (parseInt(currSaleType.dataset.number) % 4 == 0) {
                                if ((quest >= (parseInt(currSaleType.dataset.number) / 4)) && (quartButton.checked == true)) {
                                    // There definitely is
                                    quartButton.disabled = false;
                                    if (halfButton.checked && quartButton.checked) {
                                        totalQuant.textContent = `${quantity.value} and three quarters (¾)`
                                    } else if (quartButton.checked) {
                                        totalQuant.textContent = `${quantity.value} and a quarter (¼)`
                                    } else if (halfButton.checked) {
                                        totalQuant.textContent = `${quantity.value} and a half (½)`
                                    } else {
                                        totalQuant.textContent = `${quantity.value}`
                                    }
                                    return;
                                } else if ((quest >= (parseInt(currSaleType.dataset.number) / 4)) && (quartButton.checked == false)) {
                                    // There definitely is
                                    quartButton.disabled = false;
                                    if (halfButton.checked && quartButton.checked) {
                                        totalQuant.textContent = `${quantity.value} and three quarters (¾)`
                                    } else if (quartButton.checked) {
                                        totalQuant.textContent = `${quantity.value} and a quarter (¼)`
                                    } else if (halfButton.checked) {
                                        totalQuant.textContent = `${quantity.value} and a half (½)`
                                    } else {
                                        totalQuant.textContent = `${quantity.value}`
                                    }
                                    return;
                                } else {
                                    // There definitely isn't
                                    quartButton.disabled = true;
                                    totalQuant.textContent = `${quantity.value} and a half (½)`
                                    return;
                                }
                            }
                        }
                    } else {
                        // Customer only wants half
                        remainder = parseInt(document.getElementById("quantleft").value) - (1 * parseInt(currSaleType.dataset.number))
                        if (remainder >= (parseInt(currSaleType.dataset.number) / 2)) {
                            // There's probably enough to supply quarter more
                            var quest = remainder - (parseInt(currSaleType.dataset.number) / 2);

                            // Only possible if number is divisible by 4
                            if (parseInt(currSaleType.dataset.number) % 4 == 0) {
                                if ((quest >= (parseInt(currSaleType.dataset.number) / 4)) && (quartButton.checked == true)) {
                                    // There definitely is
                                    quartButton.disabled = false;
                                    if (halfButton.checked && quartButton.checked) {
                                        totalQuant.textContent = `Three quarters (¾)`
                                    } else if (quartButton.checked) {
                                        totalQuant.textContent = `Quarter (¼)`
                                    } else if (halfButton.checked) {
                                        totalQuant.textContent = `Half (½)`
                                    }
                                    return;
                                } else if ((quest >= (parseInt(currSaleType.dataset.number) / 4)) && (quartButton.checked == false)) {
                                    // There definitely is
                                    quartButton.disabled = false;
                                    if (halfButton.checked && quartButton.checked) {
                                        totalQuant.textContent = `Three quarters (¾)`
                                    } else if (quartButton.checked) {
                                        totalQuant.textContent = `Quarter (¼)`
                                    } else if (halfButton.checked) {
                                        totalQuant.textContent = `Half (½)`
                                    }
                                    return;
                                } else {
                                    // There definitely isn't
                                    quartButton.disabled = true;
                                    totalQuant.textContent = `Half (½)`
                                    return;
                                }
                            }
                        }
                    }
                } else {
                    // alert("False");
                    // Customer no longer wants half, or half more
                    const currSaleType = document.querySelector("input[name=saleType]:checked");
                    if (isWhole.checked == false) {
                        // Customer wants whole and probably quarter quantities
                        remainder = parseInt(document.getElementById("quantleft").value) - (parseInt(quantity.value) * parseInt(currSaleType.dataset.number));

                        // Free up quantity to check for quarter availability
                        // var quest = remainder - parseInt(currSaleType.dataset.number);
                        
                        // Only possible if number is divisible by 4
                        if (parseInt(currSaleType.dataset.number) % 4 == 0) {
                            if ((remainder >= (parseInt(currSaleType.dataset.number) / 4)) && (quartButton.checked == true)) {
                                // There definitely is enough for quarter
                                // alert("True disable");
                                quartButton.disabled = false;
                                if (halfButton.checked && quartButton.checked) {
                                    totalQuant.textContent = `${quantity.value} and three quarters (¾)`
                                } else if (quartButton.checked) {
                                    totalQuant.textContent = `${quantity.value} and a quarter (¼)`
                                } else if (halfButton.checked) {
                                    totalQuant.textContent = `${quantity.value} and a half (½)`
                                } else {
                                    totalQuant.textContent = `${quantity.value}`
                                }
                                return;
                            } else if ((remainder >= (parseInt(currSaleType.dataset.number) / 4)) && (quartButton.checked == false)) {
                                // There definitely is enough for quarter
                                // alert("False disable");
                                quartButton.disabled = false;
                                if (halfButton.checked && quartButton.checked) {
                                    totalQuant.textContent = `${quantity.value} and three quarters (¾)`
                                } else if (quartButton.checked) {
                                    totalQuant.textContent = `${quantity.value} and a quarter (¼)`
                                } else if (halfButton.checked) {
                                    totalQuant.textContent = `${quantity.value} and a half (½)`
                                } else {
                                    totalQuant.textContent = `${quantity.value}`
                                }
                                return;
                            } else {
                                // There definitely isn't
                                // alert(`${remainder} ${currSaleType.dataset.number} ${quartButton.checked}`)
                                quartButton.disabled = true;
                                totalQuant.textContent = `${quantity.value}`;
                                return;
                            }
                        }
                    } else {
                        // Customer only wants whole quantities instead
                        // alert("Whole quantities instead")
                        remainder = parseInt(document.getElementById("quantleft").value) - (1 * parseInt(currSaleType.dataset.number));

                        // Only possible if number is divisible by 4
                        if (parseInt(currSaleType.dataset.number) % 4 == 0) {
                            // alert("Check first")
                            if ((remainder >= (parseInt(currSaleType.dataset.number) / 4)) && (quartButton.checked == true)) {
                                // There definitely is enough for quarter
                                // alert("True disable");
                                quartButton.disabled = false;
                                if (halfButton.checked && quartButton.checked) {
                                    totalQuant.textContent = `Three quarters (¾)`
                                } else if (quartButton.checked) {
                                    totalQuant.textContent = `Quarter (¼)`
                                } else if (halfButton.checked) {
                                    totalQuant.textContent = `Half (½)`
                                }
                                return;
                            } else if ((remainder >= (parseInt(currSaleType.dataset.number) / 4)) && (quartButton.checked == false)) {
                                // Customer wants neither, revert.
                                // alert("False disable");
                                quartButton.disabled = false;
                                isWhole.click();
                                return;
                            } else {
                                // There definitely isn't
                                // alert(`${remainder} ${currSaleType.dataset.number} ${quartButton.checked}`)
                                quartButton.disabled = true;
                                isWhole.click();
                                return;
                            }
                        } else {
                            // alert("Check second");
                            isWhole.click();
                        }
                    }
                }
                if (halfButton.checked && quartButton.checked) {
                    totalQuant.textContent = `${quantity.value} and three quarters (¾)`;
                } else if (quartButton.checked) {
                    totalQuant.textContent = `${quantity.value} and a quarter (¼)`;
                } else if (halfButton.checked) {
                    totalQuant.textContent = `${quantity.value} and a half (½)`;
                } else {
                    totalQuant.textContent = `${quantity.value}`;
                }

            // button is the quart_button increasing quantity of goods by a quarter
            } else if (element.id == "quart_button") {
                if (element.checked == true) {
                    // Check if half button can also be selected
                    const currSaleType = document.querySelector("input[name=saleType]:checked");
                    if (isWhole.checked == false) {
                        remainder = parseInt(document.getElementById("quantleft").value) - (parseInt(quantity.value) * parseInt(currSaleType.dataset.number))
                        if (remainder >= (parseInt(currSaleType.dataset.number) / 4)) {
                            // There's probably enough to supply half more
                            var quest = remainder - (parseInt(currSaleType.dataset.number) / 4);
                            // May do likewise here
                            if (quest >= (parseInt(currSaleType.dataset.number) / 2) && (halfButton.checked == true)) {
                                // There definitely is
                                halfButton.disabled = false;
                                if (halfButton.checked && quartButton.checked) {
                                    totalQuant.textContent = `${quantity.value} and three quarters (¾)`
                                } else if (quartButton.checked) {
                                    totalQuant.textContent = `${quantity.value} and a quarter (¼)`
                                } else if (halfButton.checked) {
                                    totalQuant.textContent = `${quantity.value} and a half (½)`
                                } else {
                                    totalQuant.textContent = `${quantity.value}`
                                }
                                return;
                            } else if (quest >= (parseInt(currSaleType.dataset.number) / 2) && (halfButton.checked == false)) {
                                // There definitely is
                                halfButton.disabled = false;
                                if (halfButton.checked && quartButton.checked) {
                                    totalQuant.textContent = `${quantity.value} and three quarters (¾)`
                                } else if (quartButton.checked) {
                                    totalQuant.textContent = `${quantity.value} and a quarter (¼)`
                                } else if (halfButton.checked) {
                                    totalQuant.textContent = `${quantity.value} and a half (½)`
                                } else {
                                    totalQuant.textContent = `${quantity.value}`
                                }
                                return;
                            } else {
                                // There definitely isn't
                                halfButton.disabled = true;
                                totalQuant.textContent = `${quantity.value} and a quarter (¼)`;
                                return;
                            }
                        }
                    } else {
                        remainder = parseInt(document.getElementById("quantleft").value) - (1 * parseInt(currSaleType.dataset.number))
                        if (remainder >= (parseInt(currSaleType.dataset.number) / 4)) {
                            // There's probably enough to supply half more
                            var quest = remainder - (parseInt(currSaleType.dataset.number) / 4);
                            // May do likewise here
                            if (quest >= (parseInt(currSaleType.dataset.number) / 2) && (halfButton.checked == true)) {
                                // There definitely is
                                halfButton.disabled = false;
                                if (halfButton.checked && quartButton.checked) {
                                    totalQuant.textContent = `Three quarters (¾)`
                                } else if (quartButton.checked) {
                                    totalQuant.textContent = `Quarter (¼)`
                                } else if (halfButton.checked) {
                                    totalQuant.textContent = `Half (½)`
                                }
                                return;
                            } else if (quest >= (parseInt(currSaleType.dataset.number) / 2) && (halfButton.checked == false)) {
                                // There definitely is
                                halfButton.disabled = false;
                                if (halfButton.checked && quartButton.checked) {
                                    totalQuant.textContent = `Three quarters (¾)`
                                } else if (quartButton.checked) {
                                    totalQuant.textContent = `Quarter (¼)`
                                } else if (halfButton.checked) {
                                    totalQuant.textContent = `Half (½)`
                                }
                                return;
                            } else {
                                // There definitely isn't
                                halfButton.disabled = true;
                                totalQuant.textContent = `Quarter (¼)`;
                                return;
                            }
                        }
                    }
                } else {
                    // Customer no longer wants quarter, or quarter more
                    const currSaleType = document.querySelector("input[name=saleType]:checked");
                    if (isWhole.checked == false) {
                        remainder = parseInt(document.getElementById("quantleft").value) - (parseInt(quantity.value) * parseInt(currSaleType.dataset.number));
                    
                        // Free up quantity to check for half availability
                        // var quest = remainder - parseInt(currSaleType.dataset.number);

                        if ((remainder >= (parseInt(currSaleType.dataset.number) / 2)) && (halfButton.checked == true)) {
                            // There definitely is enough for half
                            // alert("True disable");
                            halfButton.disabled = false;
                            if (halfButton.checked && quartButton.checked) {
                                totalQuant.textContent = `${quantity.value} and three quarters (¾)`
                            } else if (quartButton.checked) {
                                totalQuant.textContent = `${quantity.value} and a quarter (¼)`
                            } else if (halfButton.checked) {
                                totalQuant.textContent = `${quantity.value} and a half (½)`
                            } else {
                                totalQuant.textContent = `${quantity.value}`
                            }
                            return;
                        } else if ((remainder >= (parseInt(currSaleType.dataset.number) / 2)) && (halfButton.checked == false)) {
                            // There definitely is enough for half
                            // alert("False disable");
                            halfButton.disabled = false;
                            if (halfButton.checked && quartButton.checked) {
                                totalQuant.textContent = `${quantity.value} and three quarters (¾)`
                            } else if (quartButton.checked) {
                                totalQuant.textContent = `${quantity.value} and a quarter (¼)`
                            } else if (halfButton.checked) {
                                totalQuant.textContent = `${quantity.value} and a half (½)`
                            } else {
                                totalQuant.textContent = `${quantity.value}`
                            }
                            return;
                        } else {
                            // There definitely isn't
                            halfButton.disabled = true;
                            totalQuant.textContent = `${quantity.value}`;
                            return;
                        }
                    } else {
                        remainder = parseInt(document.getElementById("quantleft").value) - (1 * parseInt(currSaleType.dataset.number));

                        if ((remainder >= (parseInt(currSaleType.dataset.number) / 2)) && (halfButton.checked == true)) {
                            // There definitely is enough for half
                            // alert("True disable");
                            halfButton.disabled = false;
                            if (halfButton.checked && quartButton.checked) {
                                totalQuant.textContent = `Three quarters (¾)`
                            } else if (quartButton.checked) {
                                totalQuant.textContent = `Quarter (¼)`
                            } else if (halfButton.checked) {
                                totalQuant.textContent = `Half (½)`
                            }
                            return;
                        } else if ((remainder >= (parseInt(currSaleType.dataset.number) / 2)) && (halfButton.checked == false)) {
                            // Customer wants neither, revert.
                            // alert("False disable");
                            halfButton.disabled = false;
                            isWhole.click();
                            return;
                        } else {
                            // There definitely isn't
                            halfButton.disabled = true;
                            isWhole.click();
                            return;
                        }
                    }                 
                }
                if (halfButton.checked && quartButton.checked) {
                    totalQuant.textContent = `${quantity.value} and three quarters (¾)`
                } else if (quartButton.checked) {
                    totalQuant.textContent = `${quantity.value} and a quarter (¼)`
                } else if (halfButton.checked) {
                    totalQuant.textContent = `${quantity.value} and a half (½)`
                } else {
                    totalQuant.textContent = `${quantity.value}`
                }

            } else if (element.id == "addToCart") {
                const successful = document.getElementById("toastSuccess");
                const successfulerToast = bootstrap.Toast.getOrCreateInstance(successful)
                const updateful = document.getElementById("toastUpdate");
                const updateToast = bootstrap.Toast.getOrCreateInstance(updateful)
                const unSuccess = document.getElementById("toastError");
                const failToast = bootstrap.Toast.getOrCreateInstance(unSuccess)

                // button is the add to cart button that adds item to customer's cart
                document.getElementById("addToCart").style.display = "none";
                document.getElementById("load_button").style.display = "block";
                document.getElementById("cancel_buy").disabled = true;

                const custName = document.getElementById("openCart");
                
                // obtain variables here
                const currSaleType = document.querySelector("input[name=saleType]:checked");
                var finQuantity = parseFloat(quantity.value);
                // quantity textbox is still available
                var oquantity = document.getElementsByName("oquantity");
                for (const box of oquantity) {
                    if (box.checked) {
                        finQuantity += parseFloat(box.value);
                    }
                }
                const productImage = document.getElementById("retailbutton").dataset.image;
                const sluger = document.getElementById("priceCall").dataset.slug;
                const productPrice = document.getElementById("priceHold").value;
                const truesale = currSaleType.dataset.truesale;
                const productName = document.querySelector('.modal-title').textContent;
                var totalProdQuant = parseFloat(currSaleType.dataset.number) * finQuantity

                const cartData = {cartName: custName.value, prodName: productName,
                saleType: currSaleType.value, prodPrice: productPrice, prodImage: productImage,
                prodQuantity: finQuantity, totalProdQuantity: totalProdQuant, prodSlug: sluger,
                true_sale_type: truesale};

                const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

                // Use POST, not GET
                fetch(`/find_staff_cart/`, {
                    method: "POST",
                    headers: {'X-CSRFToken': csrftoken,
                                "Content-Type": "application/json"},
                    mode: "same-origin",
                    body: JSON.stringify(cartData),
                })
                .then((response) => {
                    if (!response.ok) {
                        failToast.show();
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json()})
                .then(data => {
                    const result = data.result
                    const productModal = bootstrap.Modal.getInstance(document.getElementById('productInfoModal'))
                    if (result === true) {
                        const noOfCarts = document.getElementById("noOfCarts");
                        if (!noOfCarts) {
                            const badge = document.createElement("span");
                            badge.className = "badge text-bg-secondary";
                            badge.textContent = "1";
                            badge.id = "noOfCarts";
                            document.querySelector("#theStaffCart").append(badge);
                        } else {
                            var cust_array = [];
                            var i;
                            for (i = 0; i < document.getElementById("cartList").options.length; i++) {
                                cust_array.push(document.getElementById("cartList").options[i].value)
                            }
                            if (!(cust_array.includes(custName.value))) {
                                noOfCarts.textContent = parseInt(document.querySelector("#noOfCustomers").value) + 1
                            }
                        }
                        successfulerToast.show()
                        productModal.hide()
                    } else if (result === 1) {
                        updateToast.show()
                        productModal.hide()
                    } else {
                        failToast.show();
                    }
                })
                .catch(error => {
                    // failToast.show();
                    console.error({"error": error});
                });

            } else if (element.id == "isWhole") {
                // button is determinant of customer buying only half, or 1 and half
                halfButton.checked = false;
                quartButton.checked = false;
                if (element.checked == true) {
                    // Customer only wants half
                    quantity.disabled = true;
                    quantity.value = 0;
                    document.getElementById("plus_button").disabled = true;
                    document.getElementById("minus_button").disabled = true;
                    if (halfButton.disabled == false) {
                        halfButton.checked = true;
                        totalQuant.textContent = "Half (½)";
                    } else if (quartButton.disabled == false) {
                        quartButton.checked = true;
                        totalQuant.textContent = "Quarter (¼)";
                    }
                } else {
                    // Customer wants 1 and half
                    quantity.disabled = false;
                    quantity.value = 1;
                    document.getElementById("plus_button").disabled = false;
                    document.getElementById("minus_button").disabled = true;
                    halfButton.checked = false;
                    quartButton.checked = false;
                    totalQuant.textContent = 1;
                }
            }
        })

        document.querySelector("#openCart").onkeyup = () => {
            if (document.querySelector("#openCart").value.length > 0) {
                if (document.querySelector("#prodquantity").value.length > 0) {
                    document.querySelector("#addToCart").disabled = false;
                } else {
                    document.querySelector("#addToCart").disabled = true;
                }
            } else {
                document.querySelector("#addToCart").disabled = true;
            }
        }

        // Get variables needed here for toast
        const successfulToast = document.getElementById("toastSuccess");
        successfulToast.addEventListener("show.bs.toast", () => {
            var productName = document.querySelector('.modal-title').textContent;
            var customerName = document.querySelector("#openCart").value;
            document.getElementById("prodID").textContent = productName;
            document.getElementById("custID").textContent = customerName;
        })

        const updatefulToast = document.getElementById("toastUpdate");
        updatefulToast.addEventListener("show.bs.toast", () => {
            var customerName = document.querySelector("#openCart").value;
            document.getElementById("customID").textContent = customerName;
        })

        // Acts similarly with plus and minus buttons
        document.querySelector("#prodquantity").onkeyup = function() {
            const halfButton = document.getElementById("half_button");
            const quartButton = document.getElementById("quart_button");
            const quantity = document.getElementById("prodquantity");
            const totalQuant = document.getElementById("totalQuantity");
            const currSaleType = document.querySelector("input[name=saleType]:checked");
            if (quantity.value == "") {
                // alert("here");
                quantity.value = 1;
            }
            if (currSaleType.value == "Pieces (Retail)") {
                if (parseInt(quantity.value) <= 1) {
                    quantity.value = 1;
                    document.getElementById("minus_button").disabled = true;
                    document.getElementById("plus_button").disabled = false;
                } else if (parseInt(quantity.value) >= parseInt(document.getElementById("quantleft").value)) {
                    quantity.value = document.getElementById("quantleft").value;
                    document.getElementById("minus_button").disabled = false;
                    document.getElementById("plus_button").disabled = true;
                } else {
                    quantity.value = parseInt(quantity.value);
                    document.getElementById("minus_button").disabled = false;
                    document.getElementById("plus_button").disabled = false;
                }
            } else if (currSaleType.value == "Pieces (Wholesale)") {
                if (parseInt(quantity.value) <= 1) {
                    quantity.value = 1;
                    document.getElementById("minus_button").disabled = true;
                    document.getElementById("plus_button").disabled = false;
                } else if (parseInt(quantity.value) >= parseInt(document.getElementById("quantleft").value)) {
                    quantity.value = document.getElementById("quantleft").value;
                    document.getElementById("minus_button").disabled = false;
                    document.getElementById("plus_button").disabled = true;
                } else {
                    quantity.value = parseInt(quantity.value);
                    document.getElementById("minus_button").disabled = false;
                    document.getElementById("plus_button").disabled = false;
                }
            } else if (currSaleType.value == "Carton" || currSaleType.value == "Bag") {
                if (parseInt(quantity.value) <= 1) {
                    quantity.value = 1;
                    document.getElementById("minus_button").disabled = true;
                    document.getElementById("plus_button").disabled = false;
                } else if (parseInt(quantity.value) >= parseInt(currSaleType.dataset.stock)) {
                    quantity.value = currSaleType.dataset.stock;
                    var remainder = parseInt(document.getElementById("quantleft").value) - (parseInt(currSaleType.dataset.number) * parseInt(currSaleType.dataset.stock))
                    if (remainder < Math.floor(parseInt(currSaleType.dataset.number) / 4)) {
                        quartButton.checked = false;
                        quartButton.disabled = true;
                    } else if (remainder > Math.floor(parseInt(currSaleType.dataset.number) / 4) && remainder < Math.floor(parseInt(currSaleType.dataset.number) / 2) && currSaleType.dataset.divisibility != "false") {
                        quartButton.disabled = false;
                        halfButton.checked = false;
                        halfButton.disabled = true;
                    } else if (remainder < Math.floor(parseInt(currSaleType.dataset.number) / 2)) {
                        halfButton.checked = false;
                        halfButton.disabled = true;
                        quartButton.checked = false;
                        quartButton.disabled = true;
                    } else if (currSaleType.dataset.divisibility == "false") {
                        halfButton.checked = false;
                        halfButton.disabled = true;
                        quartButton.checked = false;
                        quartButton.disabled = true;
                    } else {
                        if ((parseInt(currSaleType.dataset.number) % 4) != 0) {
                            quartButton.disabled = true;
                            quartButton.checked = false;
                            halfButton.disabled = false;
                        } else if ((parseInt(currSaleType.dataset.number) % 2) != 0) {
                            halfButton.checked = false;
                            halfButton.disabled = true;
                            quartButton.checked = false;
                            quartButton.disabled = true;
                        } else {
                            halfButton.disabled = false;
                            quartButton.disabled = false;
                        }
                    }
                    document.getElementById("minus_button").disabled = false;
                    document.getElementById("plus_button").disabled = true;
                } else {
                    quantity.value = parseInt(quantity.value);
                    document.getElementById("minus_button").disabled = false;
                    document.getElementById("plus_button").disabled = false;
                    var remainder = parseInt(document.getElementById("quantleft").value) - (parseInt(element.dataset.number) * parseInt(element.dataset.stock))
                    if (remainder < Math.floor(parseInt(element.dataset.number) / 4)) {
                        quartButton.checked = false;
                        quartButton.disabled = true;
                    } else if (remainder > Math.floor(parseInt(element.dataset.number) / 4) && remainder < Math.floor(parseInt(element.dataset.number) / 2) && element.dataset.divisibility != "false") {
                        quartButton.disabled = false;
                        halfButton.checked = false;
                        halfButton.disabled = true;
                    } else if (remainder < Math.floor(parseInt(element.dataset.number) / 2)) {
                        halfButton.checked = false;
                        halfButton.disabled = true;
                        quartButton.checked = false;
                        quartButton.disabled = true;
                    } else if (element.dataset.divisibility == "false") {
                        halfButton.checked = false;
                        halfButton.disabled = true;
                        quartButton.checked = false;
                        quartButton.disabled = true;
                    } else {
                        halfButton.disabled = false;
                        quartButton.disabled = false;
                    }
                }
            } else {
                if (parseInt(quantity.value) <= 1) {
                    quantity.value = 1;
                    var remainder = parseInt(document.getElementById("quantleft").value) - (parseInt(currSaleType.dataset.number) * parseInt(quantity.value))
                        if ((remainder > (Math.floor(parseInt(currSaleType.dataset.number) / 4) + Math.floor(parseInt(currSaleType.dataset.number) / 2))) && ((parseInt(currSaleType.dataset.number) % 4) == 0) && ((parseInt(currSaleType.dataset.number) % 2) == 0)) {
                            halfButton.disabled = false;
                            quartButton.disabled = false;
                        } else if (remainder < Math.floor(parseInt(currSaleType.dataset.number) / 4)) {
                            quartButton.checked = false;
                            quartButton.disabled = true;
                        } else if (remainder < Math.floor(parseInt(currSaleType.dataset.number) / 2)) {
                            halfButton.checked = false;
                            halfButton.disabled = true;
                            quartButton.checked = false;
                            quartButton.disabled = true;
                        } else {
                            if ((parseInt(currSaleType.dataset.number) % 4) != 0) {
                                quartButton.disabled = true;
                                quartButton.checked = false;
                                halfButton.disabled = false;
                            } else if ((parseInt(currSaleType.dataset.number) % 2) != 0) {
                                halfButton.checked = false;
                                halfButton.disabled = true;
                                quartButton.checked = false;
                                quartButton.disabled = true;
                            } else {
                                halfButton.disabled = false;
                                quartButton.disabled = false;
                            }
                        }
                    document.getElementById("minus_button").disabled = true;
                    document.getElementById("plus_button").disabled = false;
                } else if (((parseInt(quantity.value) + 1) * parseInt(currSaleType.dataset.number)) >= parseInt(document.getElementById("quantleft").value)) {
                    document.getElementById("plus_button").disabled = true;
                    // Getting a headache here
                    var allowQuant = Math.floor(parseInt(document.getElementById("quantleft").value)/parseInt(currSaleType.dataset.number))
                    quantity.value = allowQuant;
                    var remainder = parseInt(document.getElementById("quantleft").value) - (parseInt(currSaleType.dataset.number) * parseInt(quantity.value))
                    
                    if ((remainder < (Math.floor(parseInt(currSaleType.dataset.number) / 4) + Math.floor(parseInt(currSaleType.dataset.number) / 2))) && ((parseInt(currSaleType.dataset.number) % 4) == 0) && ((parseInt(currSaleType.dataset.number) % 2) == 0)) {
                        halfButton.checked = false;
                        quartButton.checked = false;
                    } else if (remainder < Math.floor(parseInt(currSaleType.dataset.number) / 4)) {
                        quartButton.checked = false;
                        quartButton.disabled = true;
                    } else if (remainder < Math.floor(parseInt(currSaleType.dataset.number) / 2)) {
                        halfButton.checked = false;
                        halfButton.disabled = true;
                        quartButton.checked = false;
                        quartButton.disabled = true;
                    } else if (parseInt(currSaleType.dataset.number) % 2 != 0) {
                        halfButton.checked = false;
                        halfButton.disabled = true;
                        quartButton.checked = false;
                        quartButton.disabled = true;
                    } else {
                        if ((parseInt(currSaleType.dataset.number) % 4) != 0) {
                            quartButton.disabled = true;
                            quartButton.checked = false;
                            halfButton.disabled = false;
                        } else if ((parseInt(currSaleType.dataset.number) % 2) != 0) {
                            halfButton.checked = false;
                            halfButton.disabled = true;
                            quartButton.checked = false;
                            quartButton.disabled = true;
                        } else {
                            halfButton.disabled = false;
                            quartButton.disabled = false;
                        }                            
                    }
                    document.getElementById("minus_button").disabled = false;
                } else {
                    quantity.value = parseInt(quantity.value);
                    var remainder = parseInt(document.getElementById("quantleft").value) - (parseInt(currSaleType.dataset.number) * parseInt(quantity.value))
                    
                    if ((remainder > (Math.floor(parseInt(currSaleType.dataset.number) / 4) + Math.floor(parseInt(currSaleType.dataset.number) / 2))) && ((parseInt(currSaleType.dataset.number) % 4) == 0) && ((parseInt(currSaleType.dataset.number) % 2) == 0)) {
                        halfButton.disabled = false;
                        quartButton.disabled = false;
                    } else if (remainder < Math.floor(parseInt(currSaleType.dataset.number) / 4)) {
                        quartButton.checked = false;
                        quartButton.disabled = true;
                    } else if (remainder < Math.floor(parseInt(currSaleType.dataset.number) / 2)) {
                        halfButton.checked = false;
                        halfButton.disabled = true;
                        quartButton.checked = false;
                        quartButton.disabled = true;
                    } else {
                        if ((parseInt(currSaleType.dataset.number) % 4) != 0) {
                            quartButton.disabled = true;
                            quartButton.checked = false;
                            halfButton.disabled = false;
                        } else if ((parseInt(currSaleType.dataset.number) % 2) != 0) {
                            halfButton.checked = false;
                            halfButton.disabled = true;
                            quartButton.checked = false;
                            quartButton.disabled = true;
                        } else {
                            halfButton.disabled = false;
                            quartButton.disabled = false;
                        }
                    }
                    document.getElementById("minus_button").disabled = false;
                    document.getElementById("plus_button").disabled = false;
                }
            }
            if (halfButton.checked && quartButton.checked) {
                totalQuant.textContent = `${quantity.value} and three quarters (¾)`
            } else if (quartButton.checked) {
                totalQuant.textContent = `${quantity.value} and a quarter (¼)`
            } else if (halfButton.checked) {
                totalQuant.textContent = `${quantity.value} and a half (½)`
            } else {
                totalQuant.textContent = `${quantity.value}`
            }

            if (document.querySelector("#openCart").value.length > 0) {
                if (document.querySelector("#prodquantity").value.length > 0) {
                    document.querySelector("#addToCart").disabled = false;
                } else {
                    document.querySelector("#addToCart").disabled = true;
                }
            } else {
                document.querySelector("#addToCart").disabled = true;
            }
        }

        // document.addEventListener("")

        // Remove bulk info on close
        productInfoModal.addEventListener("hidden.bs.modal", () => {
            const bulkInfo = document.getElementById("bulkDiv");
            if (bulkInfo) {
                bulkInfo.remove();
            }
            const separator = document.getElementById("Separ");
            if (separator) {
                separator.remove();
            }
            const quantField = document.getElementById("prodquantity");
            quantField.value = 1;
            quantField.disabled = false;
            const discountDiv = document.getElementById("discounting");
            if (discountDiv) {
                discountDiv.remove();
            }
            document.querySelector("#openCart").value = "";
            document.querySelector("#totalQuantity").textContent = 1;
            document.querySelector("#quantleft").value = "";
            const prodAlert = document.getElementById("alertNotice");
            if (prodAlert) {
                prodAlert.remove();
            }
            const dataList = document.querySelector("#cartList");
            if (dataList) {
                dataList.remove();
            }
            document.getElementById("ze_spinner").style.display = "block";
            document.getElementById("product_content").style.display = "none";
            document.getElementById("productInfoModalLabel").style.visibility = "hidden";
            document.getElementById("addToCart").style.display = "block";
            document.getElementById("load_button").style.display = "none";
            document.getElementById("cancel_buy").disabled = false;
        })
    }

    const prodPriceModal = document.getElementById("prodPriceModal")
    if (prodPriceModal) {

        document.getElementById("retail_price").onkeyup = () => {
            if (document.getElementById("retail_price").value.trim().length > 0 && parseFloat(document.getElementById("retail_price").value) > 0 && !(document.getElementById("retail_price").value.startsWith("0"))) {
                document.getElementById("retail_price").classList.remove("is-invalid");
                if (document.getElementById("wholesale_price").value.trim().length > 0) {
                    if (document.getElementById("carton_bag_price").value.trim().length > 0) {
                        document.getElementById("initiate_update").disabled = false;
                    }
                }
            } else {
                document.getElementById("retail_price").classList.add('is-invalid');
                document.getElementById("initiate_update").disabled = true;
            }
        }

        document.getElementById("wholesale_price").onkeyup = () => {
            if (document.getElementById("wholesale_price").value.trim().length > 0 && parseFloat(document.getElementById("wholesale_price").value) > 0 && !(document.getElementById("wholesale_price").value.startsWith("0"))) {
                document.getElementById("wholesale_price").classList.remove("is-invalid");
                if (document.getElementById("retail_price").value.trim().length > 0) {
                    if (document.getElementById("carton_bag_price").value.trim().length > 0) {
                        document.getElementById("initiate_update").disabled = false;
                    }
                }
            } else {
                document.getElementById("wholesale_price").classList.add('is-invalid');
                document.getElementById("initiate_update").disabled = true;
            }
        }

        document.getElementById("carton_bag_price").onkeyup = () => {
            if (document.getElementById("carton_bag_price").value.trim().length > 0 && parseFloat(document.getElementById("carton_bag_price").value) > 0 && !(document.getElementById("carton_bag_price").value.startsWith("0"))) {
                document.getElementById("carton_bag_price").classList.remove("is-invalid");
                if (document.getElementById("retail_price").value.trim().length > 0) {
                    if (document.getElementById("wholesale_price").value.trim().length > 0) {
                        document.getElementById("initiate_update").disabled = false;
                    }
                }
            } else {
                document.getElementById("carton_bag_price").classList.add('is-invalid');
                document.getElementById("initiate_update").disabled = true;
            }
        }

        document.addEventListener("keyup", event => {
            const element = event.target;
            
            if (element.name == "bulk_prices") {
                if (element.value.trim().length > 0 && parseFloat(element.value) > 0 && !(element.value.startsWith("0"))) {
                    element.classList.remove("is-invalid");
                    if (document.getElementById("retail_price").value.trim().length > 0) {
                        if (document.getElementById("wholesale_price").value.trim().length > 0) {
                            if (document.getElementById("carton_bag_price").value.trim().length > 0) {
                                document.getElementById("initiate_update").disabled = false;
                            }
                        }
                    }
                } else {
                    element.classList.add("is-invalid");
                    document.getElementById("initiate_update").disabled = true;
                }
            }

        })
        
        document.addEventListener("click", event => {
            const element = event.target;

            if (element.id == "initiate_update") {

                // Run validation first
                if (document.getElementById("retail_price").value.trim().length < 1 || parseFloat(document.getElementById("retail_price").value) == 0) {
                    document.getElementById("retail_price").classList.add('is-invalid');
                    alert("Enter valid retail price");
                    document.getElementById("retail_price").focus();
                    return false;
                }

                if (document.getElementById("wholesale_price").value.trim().length < 1 || parseFloat(document.getElementById("wholesale_price").value) == 0) {
                    document.getElementById("wholesale_price").classList.add('is-invalid');
                    alert("Enter valid wholesale price");
                    document.getElementById("wholesale_price").focus();
                    return false;
                }

                if (document.querySelector("#carton_bag_price").value.trim().length < 1 || parseFloat(document.querySelector("#carton_bag_price").value) == 0) {
                    document.querySelector("#carton_bag_price").classList.add('is-invalid');
                    alert("Enter valid carton price");
                    document.querySelector("#carton_bag_price").focus();
                    return false;
                }

                const bulk_prices = document.getElementById("price_container");
                
                // if (bulk_prices.querySelector("input[name=bulk_prices").value.trim().length < 1 || parseFloat(bulk_prices.querySelector("input[name=bulk_prices").value) == 0) {
                //     bulk_prices.querySelector("input[name=bulk_prices").classList.add('is-invalid');
                //     alert("Enter valid bulk price");
                //     bulk_prices.querySelector("input[name=bulk_prices").focus();
                //     return false;
                // }

                const all_bulk = bulk_prices.querySelectorAll("input[name=bulk_prices");

                for (let index = 0; index < all_bulk.length; index++) {
                    const element = all_bulk[index];
                    if (element) {
                        if (element.value.trim().length < 1 || parseFloat(element.value) == 0) {
                            element.classList.add('is-invalid');
                            alert("Enter valid bulk price");
                            element.focus();
                            return false;
                        }
                    }
                }
                

                document.getElementById("initiate_update").style.display = "none";
                document.getElementById("load_button_two").style.display = "block";
                document.getElementById("cancel_price").disabled = true;

                const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
                const neoSuccess = document.getElementById("toastPriceSuccess");
                const successToast = bootstrap.Toast.getOrCreateInstance(neoSuccess)
                const unSuccess = document.getElementById("toastError");
                const failToast = bootstrap.Toast.getOrCreateInstance(unSuccess)
                const price_modal = bootstrap.Modal.getInstance(document.getElementById('prodPriceModal'));

                // Obtain data
                const the_product = document.getElementById("initiate_update").dataset.slug;
                const prod_retail_price = document.getElementById("retail_price").value;
                const prod_wholesale_price = document.getElementById("wholesale_price").value;
                const prod_cart = document.getElementById("carton_bag_price")
                var prod_cart_price = "NA";
                if (prod_cart) {
                    prod_cart_price = prod_cart.value;
                }

                var bulk_names = []

                bulk_prices.querySelectorAll("input[name=bulk_prices").forEach(element => {
                    bulk_names.push(element.dataset.type)
                });

                const info_data = {prod_slug: the_product, retail_price: prod_retail_price,
                wholesale_price: prod_wholesale_price, carton_bag_price: prod_cart_price}

                bulk_names.forEach(bulk_name => {
                    info_data[`${bulk_name}`] = document.querySelector(`input[data-type=${bulk_name}]`).value;
                });


                // Place slash before url to ensure it picks from base url, not current page, if needed
                fetch("/products/update_product_price/", {
                    method: "POST",
                    headers: {'X-CSRFToken': csrftoken,
                                "Content-Type": "application/json"},
                    mode: "same-origin",
                    body: JSON.stringify(info_data),
                })
                .then((response) => {
                    if (!response.ok) {
                        failToast.show();
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json()})
                .then(data => {
                    const result = data.result
                    if (result === "Successful") {
                        // Successful update
                        // Call update price toast
                        successToast.show();
                        // Set timeout to close modal
                        price_modal.hide()
                        location.reload();
                    } else {
                        failToast.show();
                    }
                })
                .catch(error => {
                    failToast.show();
                    console.error({"error": error});
                });
                
            }
        })

        const toastPriceSuccess = document.getElementById("toastPriceSuccess");
        toastPriceSuccess.addEventListener("show.bs.toast", () => {
            var productName = document.querySelector('.modal-title').textContent;
            document.getElementById("upd_prod").textContent = productName;
        })

        // Remove bulk & carton fields on close
        prodPriceModal.addEventListener("hidden.bs.modal", () => {
            document.getElementById("initiate_update").style.display = "block";
            document.getElementById("load_button_two").style.display = "none";
            document.getElementById("cancel_price").disabled = false;
        });
    }
});

function editPrice(dPrice) {
    var point = dPrice.indexOf(".")
    if (point != -1) {
        var strPrice  = dPrice.slice(0, point);
        var revStrPrice = strPrice.split("").reverse().join("");
        var humPrice = "";
        var decimalFig = dPrice.slice(-3)
        if (revStrPrice.length > 3) {
            for (let index = 0; index < revStrPrice.length; index++) {
                const element = revStrPrice[index];
                humPrice += element;
                if ((index + 1) % 3 == 0 && index != revStrPrice.length - 1) {
                    humPrice += ",";
                }
            }
            strPrice = humPrice.split("").reverse().join("");
            return strPrice + decimalFig;
        } else {
            return strPrice + decimalFig;
        }
    } else {
        var strPrice  = dPrice.toString();
        var revStrPrice = strPrice.split("").reverse().join("");
        var humPrice = "";
        if (revStrPrice.length > 3) {
            for (let index = 0; index < revStrPrice.length; index++) {
                const element = revStrPrice[index];
                humPrice += element;
                if ((index + 1) % 3 == 0 && index != revStrPrice.length - 1) {
                    humPrice += ",";
                }
            }
            strPrice = humPrice.split("").reverse().join("");
            return strPrice + ".00";
        } else {
            return strPrice + ".00";
        }
    }
}

