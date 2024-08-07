document.addEventListener('DOMContentLoaded', function() {
    // Example of adding some interactivity
    const statItems = document.querySelectorAll('.stat-item');

    statItems.forEach(item => {
        item.addEventListener('mouseover', function() {
            this.style.backgroundColor = '#e0f7fa';
        });

        item.addEventListener('mouseout', function() {
            this.style.backgroundColor = '#f9f9f9';
        });
    });
});
