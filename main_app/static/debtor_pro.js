document.addEventListener("DOMContentLoaded", () => {
    const unSuccess = document.getElementById("toastError")
    const failToast = bootstrap.Toast.getOrCreateInstance(unSuccess)

    const editDebtorModal = document.getElementById('editDebtorModal')
    if (editDebtorModal) {
        editDebtorModal.addEventListener('show.bs.modal', event => {
            // Button that triggered the modal
            const button = event.relatedTarget
            const debtor_slug = button.getAttribute("data-slug")

            document.getElementById("update_button").disabled = true;

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
                    d_details.textContent = `${data.debtor.phone_no[0].dialing_code}${data.debtor.phone_no[0].number} | ${data.debtor.address}, ${data.debtor.state}`

                    const more_details = document.getElementById("more_debtor_details")
                    more_details.textContent = `Descripton: ${data.debtor.description}`

                    const debt_amount = document.getElementById("amount_owed")
                    debt_amount.textContent = editPrice(data.debtor.amount_owed)

                    var today = new Date();
                    var day = String(today.getDate() - 1).padStart(2, '0');
                    var month = String(today.getMonth() + 1).padStart(2, '0');
                    var year = today.getFullYear();

                    const date_input = document.getElementById("date_collected");
                    date_input.value = `${year}-${month}-${day}`;
                    date_input.setAttribute("max", `${year}-${month}-${day}`);
                    
                    document.getElementById("ze_spinner").style.display = "none";
                    document.getElementById("collect_debt_form").style.display = "none";
                    document.getElementById("make_payment_form").style.display = "block";
                    document.getElementById("debtor_content").style.display = "block";
                } else {
                    failToast.show();
                }
            })

            // Update the modal's content.
            // Obtain UI widgets
            const nativePicker = document.querySelector(".nativeDatePicker");
            const fallbackPicker = document.querySelector(".fallbackDatePicker");
            const fallbackLabel = document.querySelector(".fallbackLabel");

            const yearSelect = document.querySelector("#year");
            const monthSelect = document.querySelector("#month");
            const daySelect = document.querySelector("#day");

            // hide fallback initially
            fallbackPicker.style.display = "none";
            fallbackLabel.style.display = "none";

            // test whether a new date input falls back to a text input or not
            const test = document.createElement("input");

            try {
                test.type = "date";
            } catch (e) {
                console.log(e.message);
            }

            // if it does, run the code inside the if () {} block
            if (test.type === "text") {
            // hide the native picker and show the fallback
            nativePicker.style.display = "none";
            fallbackPicker.style.display = "block";
            fallbackLabel.style.display = "block";

            // populate the days and years dynamically
            // (the months are always the same, therefore hardcoded)
            populateDays(monthSelect.value);
                populateYears();
            }

            function populateDays(month) {
                // delete the current set of <option> elements out of the
                // day <select>, ready for the next set to be injected
                while (daySelect.firstChild) {
                    daySelect.removeChild(daySelect.firstChild);
                }

                // Create variable to hold new number of days to inject
                let dayNum;

                // 31 or 30 days?
                if (
                    [
                    "January",
                    "March",
                    "May",
                    "July",
                    "August",
                    "October",
                    "December",
                    ].includes(month)
                ) {
                    dayNum = 31;
                } else if (["April", "June", "September", "November"].includes(month)) {
                    dayNum = 30;
                } else {
                    // If month is February, calculate whether it is a leap year or not
                    const year = yearSelect.value;
                    const isLeap = new Date(year, 1, 29).getMonth() === 1;
                    dayNum = isLeap ? 29 : 28;
                }

                // inject the right number of new <option> elements into the day <select>
                for (let i = 1; i <= dayNum; i++) {
                    const option = document.createElement("option");
                    option.textContent = i;
                    daySelect.appendChild(option);
                }

                // if previous day has already been set, set daySelect's value
                // to that day, to avoid the day jumping back to 1 when you
                // change the year
                if (previousDay) {
                    daySelect.value = previousDay;

                    // If the previous day was set to a high number, say 31, and then
                    // you chose a month with less total days in it (e.g. February),
                    // this part of the code ensures that the highest day available
                    // is selected, rather than showing a blank daySelect
                    if (daySelect.value === "") {
                    daySelect.value = previousDay - 1;
                    }

                    if (daySelect.value === "") {
                    daySelect.value = previousDay - 2;
                    }

                    if (daySelect.value === "") {
                    daySelect.value = previousDay - 3;
                    }
                }
            }

            function populateYears() {
                // get this year as a number
                const date = new Date();
                const year = date.getFullYear();

                // Make this year, and the 100 years before it available in the year <select>
                for (let i = 0; i <= 100; i++) {
                    const option = document.createElement("option");
                    option.textContent = year - i;
                    yearSelect.appendChild(option);
                }
            }

            // when the month or year <select> values are changed, rerun populateDays()
            // in case the change affected the number of available days
            yearSelect.onchange = () => {
                populateDays(monthSelect.value);
            };

            monthSelect.onchange = () => {
                populateDays(monthSelect.value);
            };

            //preserve day selection
            let previousDay;

            // update what day has been set to previously
            // see end of populateDays() for usage
            daySelect.onchange = () => {
                previousDay = daySelect.value;
            };
            
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
                document.getElementById("update_button").style.display = "none";
                document.getElementById("load_button").style.display = "block";

                // prepare data and upload
                const debt_activity = document.querySelector("input[name=debtor_activity]:checked");
                const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

                const checkVideo = document.getElementById("checkVideo");
                const update_debtor_modal = bootstrap.Modal.getInstance(document.getElementById('updateDebtorModal'));
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