document.addEventListener("DOMContentLoaded", () => {

    const productInfoModal = document.getElementById('productInfoModal')
    if (productInfoModal) {
        productInfoModal.addEventListener('show.bs.modal', event => {
            // Link that triggered the modal
            const link = event.relatedTarget
            
            // Extract info from data-* attributes
            const recipient = link.getAttribute('data-slug')

            // Set attribute data-slug to buttons for price and editing product
            var btnPrice = document.getElementById("priceCall");

            // Can use this to set dataset attribute instead
            btnPrice.setAttribute('data-slug', recipient);

            document.getElementById("minus_button").disabled = true;

            var editProd = document.getElementById("editCall");
            editProd.setAttribute("href", `/edit_product/${recipient}`)

            const modalTitle = productInfoModal.querySelector('.modal-title')

            // Fetch product's data from Django view
            fetch(`/find_product/${recipient}`)
            // Get response in json format
            .then(response => response.json())
            // and then do the updating in a callback.
            .then(data => {
                const brand_name = data.brand_name
                const product_name = data.product_name
                const size = data.size
                const product_image = data.product_image
                const tags = data.tags
                const retail_price = data.retail_price
                const wholesale_price = data.wholesale_price
                const is_discount = data.is_discount
                const discount_retail_price = data.discount_retail_price
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
                
                // Display price of selected sale type in bold font, with retail price being default
                const priceHold = document.getElementById("prodPrice")
                
                priceHold.textContent = `₦${editPrice(retail_price)}`
                // Sale type: Pieces (Retail) | Pieces (Wholesale) | Dozen (12)
                // radio buttons - retail, wholesale (Single, add separator)
                const saleType = document.getElementById("saleType");
                saleType.textContent = "Pieces (Retail)";

                // Either disable or enable half and quarter buttons
                const halfButton = document.getElementById("half_button");
                const quartButton = document.getElementById("quart_button");

                if (is_divisible === false) {
                    halfButton.disabled = true;
                    quartButton.disabled = true;
                }

                // place buttons for singles (retail and wholesale) in div,
                // with the other bulk and carton buttons in a separate div together
                // can use flex to put them together responsively
                const buttonHome = document.getElementById("buttonHolder");
                const singDiv = document.getElementById("singDiv");

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
                } else {
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
                    retailButton.dataset.image = product_image[0];
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
                    wholesaleButton.dataset.image = product_image[0];
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

                if (has_bulk) {
                    
                    buttonHome.append(vRule);

                    newBulkDiv.append(bulkText);
                    for (const key in bulk) {
                        if (key.startsWith("bulk_type")) {
                            // Extract value of key to assign to dataset
                            const element = bulk[key];
    
                            // Create button per bulk
                            const bulkButton = document.createElement("input");
                            bulkButton.type = "radio";
                            bulkButton.className = "btn-check bulk";
                            bulkButton.name = "saleType";
                            bulkButton.autocomplete = "off";
                            bulkButton.id = key;
                            
                            // Get num of items in bulk
                            const num = parseInt(key.split("_")[2]);
                            bulkButton.dataset.number = bulk["no_in_bulk_" + num];

                            // Get price of bulk
                            bulkButton.dataset.price = bulk["bulk_price_" + num];

                            // Get image of bulk
                            bulkButton.dataset.image = bulk["bulk_image_" + num][0];

                            bulkButton.value = `${element} (${bulk["no_in_bulk_" + num]})`
                            
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
                        }
                    }
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
                    y.setAttribute("for", cartButton.id);
                    y.appendChild(z);
                    y.className = "btn btn-outline-light me-2";

                    newBulkDiv.append(cartButton);
                    newBulkDiv.append(y);
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

                // Fetch cart data from Django
                fetch("/open_staff_carts")
                .then(response => response.json())
                .then(data => {
                    data.carts.forEach(element => {
                        const dataList = document.getElementById("cartList");
                        dataList.add(element);
                    });
                })
                
            }) 
            .catch(error => {
                console.error({"error": error});
            });            
        })

        document.addEventListener("click", event => {
            const element = event.target;
            const halfButton = document.getElementById("half_button");
            const quartButton = document.getElementById("quart_button");
            const quantity = document.getElementById("prodquantity");

            if (element.name == "saleType") {
                const resetQuant = document.querySelector("#prodquantity");
                resetQuant.value = 1;
                if (element.dataset.divisibility == "false") {
                    halfButton.disabled = true;
                    quartButton.disabled = true;
                } else {
                    halfButton.disabled = false;
                    quartButton.disabled = false;
                }

                const thePic = document.getElementById("centrePic");
                thePic.src = element.dataset.image;

                const saleType = document.getElementById("saleType");
                saleType.textContent = `${element.value}`;

                const priceHold = document.getElementById("prodPrice");
                priceHold.textContent = `₦${editPrice(element.dataset.price)}`;
            } else if (element.id == "plus_button") {
                quantity.value = parseInt(quantity.value) + 1;
                if (parseInt(quantity.value) > 1) {
                    document.getElementById("minus_button").disabled = false;
                }
            } else if (element.id == "minus_button") {
                quantity.value = parseInt(quantity.value) - 1;
                if (parseInt(quantity.value) >= 1) {
                    document.getElementById("plus_button").disabled = false;
                    if (parseInt(quantity.value) == 1) {
                        document.getElementById("minus_button").disabled = true;
                        return;
                    }
                    document.getElementById("minus_button").disabled = false;
                }
            }
        })

        document.querySelector("#prodquantity").onkeyup = () => {
            const currSaleType = document.querySelector("input[name=saleType]:checked");
            if (currSaleType.value == "Pieces (Retail)") {
                if (parseInt(document.querySelector("#prodquantity").value) < 1) {
                    document.querySelector("#prodquantity").value = 1;
                    document.getElementById("minus_button").disabled = true;
                    document.getElementById("plus_button").disabled = false;
                } else if (parseInt(document.querySelector("#prodquantity").value) > parseInt(document.getElementById("quantleft").value)) {
                    document.querySelector("#prodquantity").value = document.getElementById("quantleft").value;
                    document.getElementById("minus_button").disabled = false;
                    document.getElementById("plus_button").disabled = true;
                } else {
                    document.getElementById("minus_button").disabled = false;
                    document.getElementById("plus_button").disabled = false;
                }
            } else if (currSaleType.value == "Pieces (Wholesale)") {
                if (parseInt(document.querySelector("#prodquantity").value) < 1) {
                    document.querySelector("#prodquantity").value = 1;
                    document.getElementById("minus_button").disabled = true;
                    document.getElementById("plus_button").disabled = false;
                } else if (parseInt(document.querySelector("#prodquantity").value) > parseInt(document.getElementById("quantleft").value)) {
                    document.querySelector("#prodquantity").value = document.getElementById("quantleft").value;
                    document.getElementById("minus_button").disabled = false;
                    document.getElementById("plus_button").disabled = true;
                } else {
                    document.getElementById("minus_button").disabled = false;
                    document.getElementById("plus_button").disabled = false;
                }
            } else if (currSaleType.value == "Carton" || currSaleType.value == "Bag") {
                if (parseInt(document.querySelector("#prodquantity").value) < 1) {
                    document.querySelector("#prodquantity").value = 1;
                    document.getElementById("minus_button").disabled = true;
                    document.getElementById("plus_button").disabled = false;
                } else if (parseInt(document.querySelector("#prodquantity").value) > parseInt(currSaleType.dataset.number)) {
                    document.querySelector("#prodquantity").value = currSaleType.dataset.number;
                    document.getElementById("minus_button").disabled = false;
                    document.getElementById("plus_button").disabled = true;
                } else {
                    document.getElementById("minus_button").disabled = false;
                    document.getElementById("plus_button").disabled = false;
                }
            } else {
                if (parseInt(document.querySelector("#prodquantity").value) < 1) {
                    document.querySelector("#prodquantity").value = 1;
                    document.getElementById("minus_button").disabled = true;
                    document.getElementById("plus_button").disabled = false;
                } else if ((parseInt(document.querySelector("#prodquantity").value) * parseInt(currSaleType.dataset.number)) > parseInt(document.getElementById("quantleft").value)) {
                    var allowQuant = Math.floor(parseInt(document.getElementById("quantleft").value)/parseInt(currSaleType.dataset.number))
                    document.querySelector("#prodquantity").value = allowQuant;
                    document.getElementById("minus_button").disabled = false;
                    document.getElementById("plus_button").disabled = true;
                } else {
                    document.getElementById("minus_button").disabled = false;
                    document.getElementById("plus_button").disabled = false;
                }
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
        })
    }
});

function editPrice(dPrice) {
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
    } else {
        return strPrice;
    }
    return strPrice;
}
