
document.addEventListener("DOMContentLoaded", () => {

    const formal = document.getElementById("super_form");

    formal.addEventListener("submit", submission);

    var all_bulk = document.querySelector("#bulk_holder");
    var has_bulk = document.querySelector("#has_bulk").value;
    var breaker = document.querySelector("#separator");
    var m_button = document.querySelector("#minus_button");

    // also add styling to remove bottom margin
    all_bulk.style.display = "none";
    breaker.className = "d-none";
    m_button.style.display = "none";
    document.getElementById("bulk_type_1").required = false;
    document.getElementById("bulk_price_1").required = false;
    document.getElementById("no_in_bulk_1").required = false;
    
    if (has_bulk === "True") {
        all_bulk.style.display = "";
        breaker.className = "d-lg-none";
        document.getElementById("bulk_type_1").required = true;
        document.getElementById("bulk_price_1").required = true;
        document.getElementById("no_in_bulk_1").required = true;
    }
    
    document.querySelector("#has_bulk").onchange = function() {
        var selection = this.value;
        all_bulk.style.display = "none";
        breaker.className = "d-none";
        document.getElementById("bulk_type_1").required = false;
        document.getElementById("bulk_price_1").required = false;
        document.getElementById("no_in_bulk_1").required = false;
        while (bulk_types[bulk_types.length - 1] !== "bulk_type_1") {
            remove_bulk()
        }

        if (selection === "True") {
            all_bulk.style.display = "";
            breaker.className = "d-lg-none";
            document.getElementById("bulk_type_1").required = true;
            document.getElementById("bulk_price_1").required = true;
            document.getElementById("no_in_bulk_1").required = true;
        }

    };

    var is_carton_bag = document.querySelector("#is_carton_bag").value;
    var carton_price = document.querySelector("#carton_price");
    var bag_price = document.querySelector("#bag_price");
    var no_in_carton = document.querySelector("#no_in_carton");
    var no_in_bag = document.querySelector("#no_in_bag");
    var carton_image = document.querySelector("#carton_image");
    var bag_image = document.querySelector("#bag_image");
    var carton_stock = document.querySelector("#carton_stock");
    var bag_stock = document.querySelector("#bag_stock");
    var carton_divis = document.querySelector("#is_carton_divisible");
    var bag_divis = document.querySelector("#is_bag_divisible");

    carton_price.required = false;
    no_in_carton.required = false;
    carton_image.required = false;
    carton_stock.required = false;
    bag_price.required = false;
    no_in_bag.required = false;
    bag_image.required = false;
    bag_stock.required = false;
    carton_divis.required = false;
    bag_divis.required = false;

    carton_price.parentElement.parentElement.style.display = "none";
    no_in_carton.parentElement.style.display = "none";
    carton_image.parentElement.style.display = "none";
    carton_stock.parentElement.style.display = "none";
    carton_divis.parentElement.style.display = "none";
    bag_price.parentElement.parentElement.style.display = "none";
    no_in_bag.parentElement.style.display = "none";
    bag_image.parentElement.style.display = "none";
    bag_stock.parentElement.style.display = "none";
    bag_divis.parentElement.style.display = "none";

    if (is_carton_bag === "carton") {
        carton_price.required = true;
        no_in_carton.required = true;
        carton_image.required = false;
        carton_stock.required = true;
        carton_divis.required = true;

        carton_price.parentElement.parentElement.style.display = "";
        no_in_carton.parentElement.style.display = "";
        carton_image.parentElement.style.display = "";
        carton_stock.parentElement.style.display = "";
        carton_divis.parentElement.style.display = "";
        
    } else if (is_carton_bag === "bag") {
        bag_price.required = true;
        no_in_bag.required = true;
        bag_image.required = false;
        bag_stock.required = true;
        bag_divis.required = true;

        bag_price.parentElement.parentElement.style.display = "";
        no_in_bag.parentElement.style.display = "";
        bag_image.parentElement.style.display = "";
        bag_stock.parentElement.style.display = "";
        bag_divis.parentElement.style.display = "";
    }

    document.querySelector("#is_carton_bag").onchange = function() {
        var select = this.value;
        carton_price.required = false;
        no_in_carton.required = false;
        carton_image.required = false;
        carton_stock.required = false;
        carton_divis.required = false;
        bag_price.required = false;
        no_in_bag.required = false;
        bag_image.required = false;
        bag_stock.required = false;
        bag_divis.required = false;

        carton_price.parentElement.parentElement.style.display = "none";
        no_in_carton.parentElement.style.display = "none";
        carton_image.parentElement.style.display = "none";
        carton_stock.parentElement.style.display = "none";
        carton_divis.parentElement.style.display = "none";
        bag_price.parentElement.parentElement.style.display = "none";
        no_in_bag.parentElement.style.display = "none";
        bag_image.parentElement.style.display = "none";
        bag_stock.parentElement.style.display = "none";
        bag_divis.parentElement.style.display = "none";

        if (select === "carton") {
            carton_price.required = true;
            no_in_carton.required = true;
            carton_image.required = false;
            carton_stock.required = true;
            carton_divis.required = true;

            carton_price.parentElement.parentElement.style.display = "";
            no_in_carton.parentElement.style.display = "";
            carton_image.parentElement.style.display = "";
            carton_stock.parentElement.style.display = "";
            carton_divis.parentElement.style.display = "";
        } else if (select === "bag") {
            bag_price.required = true;
            no_in_bag.required = true;
            bag_image.required = false;
            bag_stock.required = true;
            bag_divis.required = true;

            bag_price.parentElement.parentElement.style.display = "";
            no_in_bag.parentElement.style.display = "";
            bag_image.parentElement.style.display = "";
            bag_stock.parentElement.style.display = "";
            bag_divis.parentElement.style.display = "";
        }
    };

    var is_discount = document.querySelector("#is_discount").value;
    var discount_price = document.querySelector("#discount_retail_price");
    discount_price.disabled = true;
    discount_price.parentElement.parentElement.style.display = "none";

    if (is_discount === "True") {
        discount_price.disabled = false;
        discount_price.parentElement.parentElement.style.display = "";
        discount_price.required = true;
    }

    document.querySelector("#is_discount").onchange = function() {
        var variable = this.value;
        discount_price.disabled = true;
        discount_price.parentElement.parentElement.style.display = "none";
        discount_price.required = false;

        if (variable === "True") {
            discount_price.disabled = false;
            discount_price.parentElement.parentElement.style.display = "";
            discount_price.required = true;
        }
    };

});

var bulk_types = ["bulk_type_1"];
var bulk_prices = ["bulk_price_1"];
var nos_in_bulk = ["no_in_bulk_1"];
var bulk_images = ["bulk_image_1"];
var buttoners = ["button_hold_1"];

function add_bulk() {
    var bulktype = document.getElementById(bulk_types[bulk_types.length - 1]);

    // change the various names and things here before appending at the end
    var n = parseInt(bulk_types[bulk_types.length - 1].split("_")[2]) + 1;
    var new_type_id = "bulk_type_" + n;
    var type_copy = bulktype.cloneNode(true);
    type_copy.setAttribute("name", new_type_id);
    type_copy.id = new_type_id;
    type_copy.required = true;
    type_copy.value = "";
    bulk_types.push(new_type_id);

    // Create label for cloned bulktype
    let g = document.createElement("LABEL");
    let f = document.createTextNode("Type Of Bulk " + n);
    g.setAttribute("for", new_type_id);
    g.appendChild(f);

    const first_hold = document.createElement("div");
    first_hold.className = "mb-3";
    first_hold.appendChild(type_copy);

    first_hold.insertBefore(g, type_copy);

    const second_hold = document.createElement("div");
    second_hold.className = "col-md-4";
    second_hold.appendChild(first_hold);

    const third_hold = document.createElement("div");
    third_hold.className = "row justify-content-evenly";
    third_hold.appendChild(second_hold);

    document.getElementById("bulk_holder").append(third_hold);

    // Do likewise for bulk price
    var bulkprice = document.getElementById(bulk_prices[bulk_prices.length - 1]);

    // change the various names and things here before appending at the end
    n = parseInt(bulk_prices[bulk_prices.length - 1].split("_")[2]) + 1;
    var new_price_id = "bulk_price_" + n;

    // Create clone
    var price_copy = bulkprice.cloneNode(true);
    price_copy.setAttribute("name", new_price_id);
    price_copy.setAttribute("placeholder", "bulk price");
    price_copy.id = new_price_id;
    price_copy.required = true;
    price_copy.value = "";
    bulk_prices.push(new_price_id);

    // Create label for cloned bulkprice
    let h = document.createElement("LABEL");
    let i = document.createTextNode("Price Of Bulk " + n);
    h.setAttribute("for", new_price_id);
    h.appendChild(i);

    // special div element for price_copy
    const special_hold = document.createElement("div");
    special_hold.className = "form-floating";
    special_hold.appendChild(price_copy);
    special_hold.appendChild(h);

    const naira_hold = document.createElement("span");
    naira_hold.className = "input-group-text";
    naira_hold.textContent = "₦";

    const special_hold_2 = document.createElement("div");
    special_hold_2.className = "input-group mb-3";
    special_hold_2.appendChild(naira_hold);
    special_hold_2.appendChild(special_hold);

    const special_hold_3 = document.createElement("div");
    special_hold_3.className = "col-md-4";
    special_hold_3.appendChild(special_hold_2);

    third_hold.appendChild(special_hold_3);
    
    const temp_hold = document.createElement("div");
    temp_hold.className = "col-md-2";

    third_hold.appendChild(temp_hold);

    // Do likewise for num in bulk
    var no_in_bulk = document.getElementById(nos_in_bulk[nos_in_bulk.length - 1]);

    // change the various names and things here before appending at the end
    n = parseInt(nos_in_bulk[nos_in_bulk.length - 1].split("_")[3]) + 1;
    var new_numbulk_id = "no_in_bulk_" + n;

    // Create clone
    var numbulk_copy = no_in_bulk.cloneNode(true);
    numbulk_copy.setAttribute("name", new_numbulk_id);
    numbulk_copy.setAttribute("placeholder", "number in bulk");
    numbulk_copy.id = new_numbulk_id;
    numbulk_copy.required = true;
    numbulk_copy.value = "";
    nos_in_bulk.push(new_numbulk_id);

    // Create label for num in bulk
    let j = document.createElement("LABEL");
    let k = document.createTextNode("Number In Bulk " + n);
    j.setAttribute("for", new_numbulk_id);
    j.appendChild(k);

    // Create div element for num in bulk
    const number_hold = document.createElement("div");
    number_hold.className = "form-floating mb-3";
    number_hold.appendChild(numbulk_copy);
    number_hold.appendChild(j);

    const sec_number_hold = document.createElement("div");
    sec_number_hold.className = "col-md-4";
    sec_number_hold.appendChild(number_hold);

    const another_third_hold = document.createElement("div");
    another_third_hold.className = "row justify-content-evenly";
    another_third_hold.appendChild(sec_number_hold);

    // Add div element containing new input to enclosing div
    document.getElementById("bulk_holder").appendChild(another_third_hold);

    // Do likewise for bulk image
    var bulk_image = document.getElementById(bulk_images[bulk_images.length - 1]);

    // change the various names and things here before appending at the end
    n = parseInt(bulk_images[bulk_images.length - 1].split("_")[2]) + 1;
    var new_bulkimage_id = "bulk_image_" + n;

    // Clone bulk image input
    var image_copy = bulk_image.cloneNode(true);
    image_copy.setAttribute("name", new_bulkimage_id);
    image_copy.id = new_bulkimage_id;
    image_copy.value = "";
    bulk_images.push(new_bulkimage_id);

    // Create label for bulk image input
    let l = document.createElement("LABEL");
    let m = document.createTextNode("Bulk " + n + "'s Image:");
    l.setAttribute("for", new_bulkimage_id);
    l.appendChild(m);

    // Create div element for bulk image input
    const last_main = document.createElement("div");
    last_main.className = "mb-3"
    last_main.appendChild(image_copy);
    last_main.insertBefore(l, image_copy);

    const last_main_two = document.createElement("div");
    last_main_two.className = "col-md-4";
    last_main_two.appendChild(last_main);

    another_third_hold.appendChild(last_main_two);

    var p_button = document.querySelector("#plus_button");
    var m_button = document.querySelector("#minus_button");
    var line_break = document.querySelector("#the_break");

    m_button.style.display = "";
    p_button.style.marginRight = "5px";

    const sec_temp_hold = document.createElement("div");
    sec_temp_hold.className = "col-md-2";
    n = parseInt(buttoners[buttoners.length - 1].split("_")[2]) + 1;
    var buttonid = "button_hold_" + n;
    sec_temp_hold.id = buttonid;
    buttoners.push(buttonid);
    sec_temp_hold.append(line_break);
    sec_temp_hold.append(p_button);
    sec_temp_hold.append(m_button);

    another_third_hold.appendChild(sec_temp_hold);

}

function remove_bulk() {
    var m_button = document.querySelector("#minus_button");
    var p_button = document.querySelector("#plus_button");
    var line_break = document.querySelector("#the_break");

    p_button.style.marginRight = "5px";

    // Find the second-to-the-last div for buttons, and append, then pop the last id in array
    const temporary_hold = document.getElementById(buttoners[buttoners.length - 2]);
    temporary_hold.appendChild(line_break);
    temporary_hold.appendChild(p_button);
    temporary_hold.appendChild(m_button);

    buttoners.pop();
    
    var curr_field_1 = document.getElementById(bulk_types[bulk_types.length - 1]);
    curr_field_1.parentElement.parentElement.parentElement.remove();
    bulk_types.pop();
    bulk_prices.pop();

    var curr_field_2 = document.getElementById(nos_in_bulk[nos_in_bulk.length - 1]);

    curr_field_2.parentElement.parentElement.parentElement.remove();
    nos_in_bulk.pop();
    bulk_images.pop();
    
    if (bulk_types[bulk_types.length - 1] === "bulk_type_1") {
        m_button.style.display = "none";
    }
}

// Validation from front end
function submission(event) {
    // Future: Run validation to ensure types of bulk are unique

    bulk_prices.forEach(element => {
        if (document.getElementById("has_bulk").value === "True") {
            const first_try = document.getElementById(element);
            comparison = document.getElementById("retail_price");
            if (parseInt(first_try.value) <= parseInt(comparison.value)) {
                first_try.focus();
                alert("Price of Bulk must be greater than Retail Price!");
                // Stop form from submitting
                event.preventDefault();
                event.stopPropagation();
            }
        }
    });

    nos_in_bulk.forEach(element => {
        if (document.getElementById("has_bulk").value === "True") {
            const second_try = document.getElementById(element);
            if (parseInt(second_try.value) < 1) {
                second_try.focus();
                alert("Number in Bulk must be greater than 0!");
                // Stop form from submitting
                event.preventDefault();
                event.stopPropagation();
            }
        }
    });

    // If has_bulk is false, empty values of bulk before submitting
    if (document.getElementById("has_bulk").value === "False") {
        document.getElementById("bulk_type_1").value = "";
        document.getElementById("bulk_price_1").value = "";
        document.getElementById("no_in_bulk_1").value = "";
        document.getElementById("bulk_image_1").value = "";
    }
}

function validity() {
    document.getElementById(this.id).onkeyup = () => {
        if (this.value.length > 0) {
            this.classList.remove("is-invalid")
        }
    }
}