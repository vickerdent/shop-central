document.addEventListener("DOMContentLoaded", () => {
    var today = new Date();
    var day = String(today.getDate()).padStart(2, '0');
    var month = String(today.getMonth() + 1).padStart(2, '0');
    var year = today.getFullYear();

    const start_date_input = document.getElementById("start_date");
    if (start_date_input.value == "") {
        start_date_input.value = `${year}-${month}-${day}`;
    }
    start_date_input.setAttribute("max", `${year}-${month}-${day}`);

    const end_date_input = document.getElementById("end_date");
    if (end_date_input.value == "") {
        end_date_input.value = `${year}-${month}-${day}`;
    }
    end_date_input.setAttribute("max", `${year}-${month}-${day}`);
})