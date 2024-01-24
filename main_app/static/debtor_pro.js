document.addEventListener("DOMContentLoaded", () => {
    const unSuccess = document.getElementById("toastError")
    const failToast = bootstrap.Toast.getOrCreateInstance(unSuccess)

    const editDebtorModal = document.getElementById('editDebtorModal')
    if (editDebtorModal) {
        editDebtorModal.addEventListener('show.bs.modal', event => {
            // Button that triggered the modal
            const button = event.relatedTarget
            const debtor_slug = button.getAttribute("data-slug")

            const update_button = document.getElementById("update_button");
            update_button.disabled = true;
            update_button.setAttribute("data-debtor", debtor_slug)

            // initiate a fetch request here
            fetch(`get_debtor/${debtor_slug}`)
            .then((response) => {
                if (!response.ok) {
                    failToast.show();
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json()})
            .then(data => {
                // Update the modal's content
                if (data.result == true) {
                    const debtor_image = document.getElementById("debtor_profile")
                    debtor_image.src = data.debtor.image[0]

                    const debtor_name = document.getElementById("debtor_name")
                    debtor_name.textContent = `${data.debtor.first_name} ${data.debtor.last_name}`

                    const d_details = document.getElementById("debtor_details")
                    d_details.textContent = `${data.debtor.phone_no[0].dialing_code}${data.debtor.phone_no[0].number} || ${data.debtor.address}, ${data.debtor.state}`

                    const more_details = document.getElementById("more_debtor_details")
                    more_details.textContent = `Descripton: ${data.debtor.description}`

                    const debt_amount = document.getElementById("amount_owed")
                    debt_amount.textContent = editPrice(data.debtor.amount_owed)

                    // var today = new Date();
                    // var day = String(today.getDate()).padStart(2, '0');
                    // var month = String(today.getMonth() + 1).padStart(2, '0');
                    // var year = today.getFullYear();

                    // const date_input = document.getElementById("date_collected");
                    // date_input.value = `${year}-${month}-${day}`;
                    // date_input.setAttribute("max", `${year}-${month}-${day}`);
                    
                    document.getElementById("ze_spinner").style.display = "none";
                    document.getElementById("collect_debt_form").style.display = "none";
                    document.getElementById("make_payment_form").style.display = "block";
                    document.getElementById("debtor_content").style.display = "block";
                } else {
                    failToast.show();
                }
            })

            // Update the modal's content.
            
        })

        document.getElementById("amount_paid").onkeyup = () => {
            if (document.getElementById("amount_paid").value.length > 0) {
                document.getElementById("amount_paid").classList.remove("is-invalid");
                document.getElementById("amount_paid").classList.add("is-valid");
                document.getElementById("update_button").disabled = false;
            } else {
                document.getElementById("update_button").disabled = true;
                document.getElementById("amount_paid").classList.add('is-invalid');
                document.getElementById("amount_paid").classList.remove("is-valid");
            }
        }

        document.getElementById("amount_collected").onkeyup = () => {
            if (document.getElementById("amount_collected").value.length > 0) {
                document.getElementById("amount_collected").classList.remove("is-invalid");
                document.getElementById("amount_collected").classList.add("is-valid");
                document.getElementById("update_button").disabled = false;
            } else {
                document.getElementById("update_button").disabled = true;
                document.getElementById("amount_collected").classList.add('is-invalid');
                document.getElementById("amount_collected").classList.remove("is-valid");
            }
        }

        editDebtorModal.addEventListener("click", (event) => {
            const element = event.target;

            if (element.id == "pay_debt") {
                document.getElementById("collect_debt_form").style.display = "none";
                document.getElementById("make_payment_form").style.display = "block";
                document.getElementById("amount_paid").value = "";
                document.getElementById("amount_paid").classList.remove("is-valid");
                document.getElementById("amount_paid").classList.remove("is-invalid");
                document.getElementById("amount_collected").value = "";
                document.getElementById("amount_collected").classList.remove("is-valid");
                document.getElementById("amount_collected").classList.remove("is-invalid");
                document.getElementById("update_button").disabled = true;
            } else if (element.id == "collect_debt") {
                document.getElementById("collect_debt_form").style.display = "block";
                document.getElementById("make_payment_form").style.display = "none";
                document.getElementById("amount_paid").value = "";
                document.getElementById("amount_paid").classList.remove("is-valid");
                document.getElementById("amount_paid").classList.remove("is-invalid");
                document.getElementById("amount_collected").value = "";
                document.getElementById("amount_collected").classList.remove("is-valid");
                document.getElementById("amount_collected").classList.remove("is-invalid");
                document.getElementById("update_button").disabled = true;
            } else if (element.id == "update_button") {
                const update_button = document.getElementById("update_button");
                update_button.style.display = "none";
                document.getElementById("load_button").style.display = "block";

                // prepare data and upload
                const debt_activity = document.querySelector("input[name=debtor_activity]:checked");
                const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
                const debtor_slug = update_button.getAttribute("data-debtor")

                const checkVideo = document.getElementById("checkVideo");
                const update_debtor_modal = bootstrap.Modal.getInstance(document.getElementById('editDebtorModal'));
                const txnSuccessfulModal = new bootstrap.Modal(document.getElementById('txnSuccessfulModal'), {
                    keyboard: false
                });

                if (debt_activity.value == "make_payment") {
                    // Debtor wants to pay debt
                    if (document.getElementById("amount_paid").value.trim().length < 1) {
                        document.getElementById("amount_paid").classList.add('is-invalid');
                        alert("Enter valid input for amount to be paid");
                        document.getElementById("amount_paid").focus();
                        return false;
                    }

                    // Get data to be submitted
                    const amount_to_pay = document.getElementById("amount_paid").value;

                    const debt_data = {d_phone_no: debtor_slug, amount_brought: amount_to_pay};

                    fetch("/update_debtor/", {
                        method: "POST",
                        headers: {'X-CSRFToken': csrftoken,
                                    "Content-Type": "application/json"},
                        mode: "same-origin",
                        body: JSON.stringify(debt_data),
                    })
                    .then((response) => {
                        if (!response.ok) {
                            failToast.show();
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        return response.json()})
                    .then(data => {
                        const result = data.result
                        if (result === "Old Debtor") {
                            // Successful transaction
                            document.getElementById("descrip_text").style.display = "block"
                            document.getElementById("more_text").style.display = "block"
                            checkVideo.load();
                            document.getElementById("txnInfo").textContent = ` ${data.txn_id}`
                            document.getElementById("refNo").textContent = ` ${data.ref_no}`
                            // Make change to the text Content and update previous fetches
                            document.getElementById("descrip_text").textContent = `Amount Paid: ₦${editPrice(data.debt)}`
                            document.getElementById("more_text").textContent = `Total Amount Owed: ₦${editPrice(data.total_debt)}`
                            // Call modal for success
                            update_debtor_modal.hide();
                            txnSuccessfulModal.show();
                            checkVideo.play();
                        } else {
                            failToast.show();
                        }
                    })
                    .catch(error => {
                        // failToast.show();
                        console.error({"error": error});
                    });

                } else if (debt_activity.value == "more_debt") {
                    // Debtor accumulating more debt
                    if (document.getElementById("amount_collected").value.trim().length < 1) {
                        document.getElementById("amount_collected").classList.add('is-invalid');
                        alert("Enter valid input for amount to be collected");
                        document.getElementById("amount_collected").focus();
                        return false;
                    }

                    // Get data to be submitted
                    const amount_to_collect = document.getElementById("amount_collected").value;

                    const debt_data = {d_phone_no: debtor_slug, d_new_debt: amount_to_collect};

                    fetch("/update_debtor/", {
                        method: "POST",
                        headers: {'X-CSRFToken': csrftoken,
                                    "Content-Type": "application/json"},
                        mode: "same-origin",
                        body: JSON.stringify(debt_data),
                    })
                    .then((response) => {
                        if (!response.ok) {
                            failToast.show();
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        return response.json()})
                    .then(data => {
                        const result = data.result
                        if (result === "Old Debtor") {
                            // Successful transaction
                            document.getElementById("descrip_text").style.display = "block"
                            document.getElementById("more_text").style.display = "none"
                            checkVideo.load();
                            document.getElementById("txnInfo").textContent = ` ${data.txn_id}`
                            document.getElementById("refNo").textContent = ` ${data.ref_no}`
                            // Make change to the text Content and update previous fetches
                            document.getElementById("descrip_text").textContent = `Amount Owed now: ₦${editPrice(data.debt)}`
                            document.getElementById("more_text").textContent = `Total Amount Owed: ₦${editPrice(data.total_debt)}`
                            // Call modal for success
                            update_debtor_modal.hide();
                            txnSuccessfulModal.show();
                            checkVideo.play();
                        } else {
                            failToast.show();
                        }
                    })
                    .catch(error => {
                        // failToast.show();
                        console.error({"error": error});
                    });
                }
            }
        })

        editDebtorModal.addEventListener("hidden.bs.modal", () => {
            document.getElementById("ze_spinner").style.display = "block";
            document.getElementById("debtor_content").style.display = "none";
            document.getElementById("update_button").disabled = true;
            document.getElementById("update_button").style.display = "block";
            document.getElementById("load_button").style.display = "none";

        })
    }

    const txnSuccessfulModal = document.getElementById('txnSuccessfulModal')
    if (txnSuccessfulModal) {
        txnSuccessfulModal.addEventListener("click", event => {
            const element = event.target;

            if (element.id == "refresh_button") {
                const transaction_success = bootstrap.Modal.getInstance(document.getElementById('txnSuccessfulModal'));
                transaction_success.hide();
                location.reload();
            }
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