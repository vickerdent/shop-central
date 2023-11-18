document.addEventListener("DOMContentLoaded", () => {
    const productInfoModal = document.getElementById('productInfoModal')
    if (productInfoModal) {
        productInfoModal.addEventListener('show.bs.modal', event => {
            // Link that triggered the modal
            const link = event.relatedTarget
            
            // Extract info from data-bs-* attributes
            const recipient = link.getAttribute('data-bs-slug')

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

                modalTitle.textContent = `New message to ${brand_name} ${product_name}`
            }) 
            .catch(error => {
                console.error();
            });

            // Update the modal's content.
            const modalTitle = productInfoModal.querySelector('.modal-title')
            const modalBodyInput = productInfoModal.querySelector('.modal-body input')

            
            modalBodyInput.value = recipient
        })
    }
});