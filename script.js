document.addEventListener('DOMContentLoaded', () => {
    const firstSection = createSection(1);
    const container = document.querySelector('.container');
    container.appendChild(firstSection);

    // Add Section button listener
    document.getElementById('add-section').addEventListener('click', () => {
        const sectionNumber = document.querySelectorAll('.time-tracker-section').length + 1;
        const newSection = createSection(sectionNumber);
        container.appendChild(newSection);
    });

    // Snapshot button listener
    document.getElementById('snapshot').addEventListener('click', () => {
        // Capture the entire container div
        html2canvas(container).then(canvas => {
            // Create a download link
            const link = document.createElement('a');
            link.href = canvas.toDataURL(); // Convert canvas to image data URL
            link.download = 'time_tracker_snapshot.png'; // Set the download file name
            link.click(); // Trigger the download
        });
    });

    updateGrandTotal();
});

// Function to create a new section
function createSection(sectionNumber) {
    const section = document.createElement('div');
    section.classList.add('time-tracker-section');
    section.innerHTML = `
        <h3>Rate Type ${sectionNumber}</h3>
        <table class="time-table">
            <thead>
                <tr>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Total Time</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody class="time-rows">
                <tr class="time-row">
                    <td><input type="datetime-local" class="start-time"></td>
                    <td><input type="datetime-local" class="end-time"></td>
                    <td><span class="total-time">0</span> minutes (<span class="total-hours">0</span> hours)</td>
                    <td><button class="delete-row">Delete</button></td>
                </tr>
            </tbody>
        </table>
        <button class="add-row">Add Row</button>
        <div class="section-total">
            Total: <span class="section-total-hours">0</span> hours 
            <span class="section-total-minutes">0</span> minutes 
            (<span class="section-total-decimal-hours">0.00</span> decimal hours)
        </div>
        <div class="options">
            <button class="remove-section">Remove Section</button>
            <button class="clear-section">Clear Section</button>
        </div>
    `;

    // Add row button listener
    section.querySelector('.add-row').addEventListener('click', () => {
        addRow(section);
    });

    // Remove section button listener
    section.querySelector('.remove-section').addEventListener('click', () => {
        section.remove();
        updateGrandTotal();
    });

    // Clear section button listener
    section.querySelector('.clear-section').addEventListener('click', () => {
        clearSection(section);
    });

    // Attach listeners for existing rows
    section.querySelectorAll('.start-time, .end-time').forEach(input => {
        input.addEventListener('change', () => {
            updateSectionTotal(section);
        });
    });

    section.querySelector('.time-rows').addEventListener('click', event => {
        if (event.target.classList.contains('delete-row')) {
            event.target.closest('.time-row').remove();
            updateSectionTotal(section);
        }
    });

    return section;
}

// Add a new row to the section
function addRow(section) {
    const timeRows = section.querySelector('.time-rows');
    const row = document.createElement('tr');
    row.classList.add('time-row');
    row.innerHTML = `
        <td><input type="datetime-local" class="start-time"></td>
        <td><input type="datetime-local" class="end-time"></td>
        <td><span class="total-time">0</span> minutes (<span class="total-hours">0</span> hours)</td>
        <td><button class="delete-row">Delete</button></td>
    `;

    row.querySelectorAll('.start-time, .end-time').forEach(input => {
        input.addEventListener('change', () => {
            updateSectionTotal(section);
        });
    });

    timeRows.appendChild(row);
}

// Clear a section
function clearSection(section) {
    section.querySelectorAll('.start-time, .end-time').forEach(input => {
        input.value = '';
    });
    section.querySelectorAll('.time-row').forEach(row => {
        row.remove();
    });
    addRow(section);
    updateSectionTotal(section);
}

// Update total for a section
function updateSectionTotal(section) {
    let totalMinutes = 0;

    section.querySelectorAll('.time-row').forEach(row => {
        const startTime = row.querySelector('.start-time').value;
        const endTime = row.querySelector('.end-time').value;
        const totalTimeCell = row.querySelector('.total-time');
        const totalHoursCell = row.querySelector('.total-hours');

        if (startTime && endTime) {
            const start = new Date(startTime);
            const end = new Date(endTime);

            if (end > start) {
                const diffMs = end - start;
                const diffMinutes = Math.floor(diffMs / 60000);
                const diffHours = (diffMinutes / 60).toFixed(2);

                totalTimeCell.textContent = diffMinutes;
                totalHoursCell.textContent = diffHours;

                // Ensure error styles are cleared
                row.classList.remove('error');
                totalTimeCell.classList.remove('error-cell');
                totalTimeCell.style.color = '';
                totalTimeCell.style.backgroundColor = '';

                totalMinutes += diffMinutes;
            } else {
                // Show error if end time is invalid
                showErrorPopup(row);
            }
        } else {
            // Reset to default state if no valid input
            totalTimeCell.textContent = '0';
            totalHoursCell.textContent = '0';

            row.classList.remove('error');
            totalTimeCell.classList.remove('error-cell');
            totalTimeCell.style.color = '';
            totalTimeCell.style.backgroundColor = '';
        }
    });

    const sectionTotalMinutes = section.querySelector('.section-total-minutes');
    const sectionTotalHours = section.querySelector('.section-total-hours');
    const sectionTotalDecimalHours = section.querySelector('.section-total-decimal-hours');

    sectionTotalMinutes.textContent = totalMinutes % 60;
    sectionTotalHours.textContent = Math.floor(totalMinutes / 60);
    sectionTotalDecimalHours.textContent = (totalMinutes / 60).toFixed(2);

    updateGrandTotal();
}

// Display an error message for invalid input
function showErrorPopup(row) {
    const startTime = row.querySelector('.start-time').value;
    const endTime = row.querySelector('.end-time').value;

    const totalTimeCell = row.querySelector('.total-time');
    const totalHoursCell = row.querySelector('.total-hours');

    const errorMessage = "End time must be after start time.";
    totalTimeCell.textContent = errorMessage;
    totalHoursCell.textContent = 'Invalid';

    row.classList.add('error');
    totalTimeCell.classList.add('error-cell');

    alert(errorMessage);
}

// Update grand total
function updateGrandTotal() {
    let totalMinutes = 0;

    document.querySelectorAll('.time-tracker-section').forEach(section => {
        section.querySelectorAll('.time-row').forEach(row => {
            const totalTimeCell = row.querySelector('.total-time');
            const timeValue = parseInt(totalTimeCell.textContent, 10);
            if (!isNaN(timeValue)) {
                totalMinutes += timeValue;
            }
        });
    });

    const grandTotalMinutes = document.getElementById('grand-total-minutes');
    const grandTotalHours = document.getElementById('grand-total-hours');

    grandTotalMinutes.textContent = totalMinutes % 60;
    grandTotalHours.textContent = Math.floor(totalMinutes / 60);
}
