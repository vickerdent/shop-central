document.addEventListener("DOMContentLoaded", () => {
    const productInfoModal = document.getElementById('productInfoModal')
    if (productInfoModal) {
        productInfoModal.addEventListener('show.bs.modal', event => {
            // Link that triggered the modal
            const link = event.relatedTarget
            
            // Extract info from data-bs-* attributes
            const recipient = link.getAttribute('data-bs-slug')

            // Set attribute data-bs-slug to buttons for price and editing product
            var btnPrice = document.getElementById("priceCall");
            btnPrice.setAttribute('data-bs-slug', recipient);

            var editProd = document.getElementById("editCall");
            editProd.setAttribute("href", "{% url 'edit_product' " + recipient + " %}")

            const modalTitle = productInfoModal.querySelector('.modal-title')

            // Fetch product's data from Django view
            fetch(`/find_product?product=${recipient}`)
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
                const has_bulk = data.has_bulk
                // Can loop through bulk if needed
                const bulk = data.bulk
                const is_carton_bag = data.is_carton_bag
                const carton_bag_price = data.carton_bag_price
                const no_in_carton_bag = data.no_in_carton_bag
                const carton_bag_image = data.carton_bag_image
                const price_modified_date = data.price_modified_date
                const singles_stock = data.singles_stock
                const carton_bag_stock = data.carton_bag_stock
                const description = data.description

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

                // place buttons for singles (retail and wholesale) in div,
                // with the other bulk and carton buttons in a separate div together
                // can use flex to put them together responsively
                const buttonHome = document.getElementById("buttonHolder");
                const singDiv = document.getElementById("singDiv");

                if (singDiv) {
                    document.getElementById("retailbutton").checked = true;
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

                buttonHome.appendChild(newBulkDiv);
                
                if (Object.keys(data.bulk).length !== 0) {
                    newBulkDiv.append(bulkText);
                    for (const key in data.bulk) {
                        if (key.startsWith("bulk_type")) {
                            // Extract value of key to assign to dataset
                            const element = data.bulk[key];
    
                            // Create button per bulk
                            const bulkButton = document.createElement("input");
                            bulkButton.type = "radio";
                            bulkButton.className = "btn-check bulk";
                            bulkButton.name = "saleType";
                            bulkButton.autocomplete = "off";
                            bulkButton.id = key;
                            bulkButton.dataset.price = element;
                            
                            // Get num of items in bulk
                            const num = parseInt(key.split("_")[2]);
                            bulkButton.dataset.number = data.bulk["no_in_bulk_" + num];
    
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
                
                // Quantity
                // make use of display: none here, with if quantity is 1,
                // pressing the minus button will hide the textbox and make a 1/2 text visible
                // again will make 1/4 text visible                
                
            }) 
            .catch(error => {
                console.error();
            });            
        })

        // Remove bulk info on close
        productInfoModal.addEventListener("hide.bs.modal", () => {
            const bulkInfo = document.getElementById("bulkDiv");

            bulkInfo.remove();
        })
    }
});

function editPrice(dPrice) {
    var strPrice  = dPrice.toString();
    var humPrice = "";
    if (strPrice.length > 3) {
        for (let index = 0; index < strPrice.length; index++) {
            const element = strPrice[index];
            humPrice += element;
            if (index == 0) {
                humPrice += ",";
                continue;
            } else if (index % 3 == 0 && index != strPrice.length - 1) {
                humPrice += ",";
                continue;
            }
        }
    } else {
        humPrice = strPrice;
    }
    return humPrice;
}