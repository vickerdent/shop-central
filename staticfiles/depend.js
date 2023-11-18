document.addEventListener("DOMContentLoaded", () => {
    var bulk_name = document.querySelector("#bulk_name_1");
    var bulk_price = document.querySelector("#bulk_price_1");
    var no_in_bulk = document.querySelector("#no_in_bulk_1");
    var has_bulk = document.querySelector("#has_bulk").value;
    // bulk_name.disabled = true;
    // bulk_price.disabled = true;
    // no_in_bulk.disabled = true;
    bulk_name.parentElement.hidden = true;
    bulk_price.parentElement.hidden = true;
    no_in_bulk.parentElement.hidden = true;

    if (has_bulk === "True") {
        console.log(has_bulk)
        bulk_price.disabled = false;
        bulk_name.disabled = false;
        no_in_bulk.disabled = false;
        bulk_name.parentElement.hidden = false;
        bulk_price.parentElement.hidden = false;
        no_in_bulk.parentElement.hidden = false;
    }
    
    document.querySelector("#has_bulk").onchange = function() {
        var selection = this.value
        // bulk_name.disabled = true;
        // bulk_price.disabled = true;
        // no_in_bulk.disabled = true;
        bulk_name.parentElement.hidden = true;
        bulk_price.parentElement.hidden = true;
        no_in_bulk.parentElement.hidden = true;
        
        if (selection === "True") {
            bulk_price.disabled = false;
            bulk_name.disabled = false;
            no_in_bulk.disabled = false;
            bulk_name.parentElement.hidden = false;
            bulk_price.parentElement.hidden = false;
            no_in_bulk.parentElement.hidden = false;
        } else if (selection === "False") {
            // bulk_name.disabled = true;
            // bulk_price.disabled = true;
            // no_in_bulk.disabled = true;
            bulk_name.parentElement.hidden = true;
            bulk_price.parentElement.hidden = true;
            no_in_bulk.parentElement.hidden = true;
        }

    }
})