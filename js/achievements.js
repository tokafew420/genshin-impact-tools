// Load the 'achievements' module using the 'app.require' function and execute a callback function
app.require(['achievements'],
    function (achievements) {
        // Get references to various DOM elements using jQuery
        const $categories = $('#achievement-category');
        const $list = $('#achievement-list');
        const $totalAchieved = $('.total-achieved');

        // Retrieve saved achievements from local storage and split them into an array
        const savedAchievement = (app.localStorage.get('achievements') || '').split(',').filter((a) => !!a);
        const achieved = []; // Array to store achieved achievements
        let totalAchieved = 0; // Count of total achieved achievements

        // Process the achievements array
        const categories = achievements.map((a) => {
                // Set total count of actual achievements (1 or 3)
                a.total = 1;
                if (Array.isArray(a.reward)) {
                    a.total = a.reward.length;
                }
                // Generate unique code
                a.code = app.generateCode(a.name);
                // Initialize achieved state for each achievement
                a.achieved = 0;
                var savedIdx
                // Check for achievements that were restored from local storage
                while ((savedIdx = savedAchievement.indexOf(a.code)) !== -1) {
                    totalAchieved++;
                    a.achieved++;
                    savedAchievement.splice(savedIdx, 1);
                    achieved.push(a.code);
                }
                
                // Return the category of the achievement
                return a.category;
            })
            // Filter out duplicate categories
            .filter((value, index, self) => self.indexOf(value) === index)
            // Create an array of category objects with achievement statistics
            .map((c) => {
                return {
                    name: c,
                    achieved: achievements.filter((a) => a.category === c).reduce((total, a) => total + a.achieved, 0),
                    total: achievements.filter((a) => a.category === c).reduce((total, a) => total + a.total, 0)
                };
            });

        // Calculate the total number of achievements
        const totalAchievements = categories.reduce((total, c) => total + c.total, 0);
        // Update the displayed total achieved achievements count
        $totalAchieved.text(`(${totalAchieved}/${totalAchievements})`);

        // Iterate through each category and create corresponding HTML elements
        categories.forEach((c, idx) => {
            // Calculate the percentage of achievements achieved in this category
            const percent = Math.floor(c.achieved / c.total * 100);
            // Append a link element for each category to the category container
            $categories.append($(`<a class="list-group-item list-group-item-action" href="#category-${idx}">
    <div class="inner-border">
        <div class="inner-content">
            <div class="m-2 mb-0">
                <h5 class="name">${c.name}</h5>
                <hr />
                <div class="progress-number">
                    <span class="percentage me-2">${percent}%</span><span class="count">(${c.achieved}/${c.total})</span>
                </div>
            </div>
            <div class="progress">
                <div class="progress-bar" role="progressbar" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100" style="width: ${percent}%;"></div>
            </div>
        </div>
    </div>
</a>`).data('category', c));
            // Create a section element for each category's list of achievements
            var $sublist = $(`<section></section>`);
            $sublist.append($(`<div id="category-${idx}" class="list-group-item list-group-item-action header">
    <div class="inner-border">
        <div class="inner-content pt-2 py-md-4">
            <div class="mx-2 mb-0">
                <h5 class="name mb-md-0">${c.name}</h5>
                <hr class="d-md-none"/>
                <div class="progress-number d-md-none">
                    <span class="percentage me-2">${percent}%</span><span class="count">(${c.achieved}/${c.total})</span>
                </div>
            </div>
            <div class="progress d-md-none">
                <div class="progress-bar" role="progressbar" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100" style="width: ${percent}%;"></div>
            </div>
        </div>
    </div>
</div>`).data('category', c));

            // Iterate through achievements in this category and create corresponding HTML elements
            achievements.filter((a) => a.category === c.name).forEach((a) => {
                $sublist.append($(`<div class="list-group-item list-group-item-action achievement ${a.total === a.achieved ? 'achieved' : ''}">
    <div class="inner-border">
        <div class="m-2 pe-5">
            <h5 class="name">${a.name}</h5>
            <div class="description">
                <span>${a.description}</span>
            </div>
            <hr />
            <div class="reward">Reward: ${a.reward} <img alt="Primogem" src="./img/Item_Primogem.png" width="18" height="18"></div>
        </div>
        <div class="achieved-check">
            <i class="fas fa-check first ${a.achieved > 0 ? 'achieved' : ''}"></i>
            ${a.total > 1 ? `<i class="fas fa-check second ${a.achieved > 1 ? 'achieved' : ''}"></i>` : ''}
            ${a.total > 2 ? `<i class="fas fa-check second ${a.achieved > 2 ? 'achieved' : ''}"></i>` : ''}
        </div>
    </div>
</div>`).data('achievement', a));
                // Append the sublist to the main achievement list
                $list.append($sublist);
            });
        });

        // Get references to headers of categories
        const $headers = $categories.find('.list-group-item').add($list.find('.header'));

        // Attach a click event handler to elements with the class '.fa-check' within '.achievement' elements
        $list.on('click', '.achievement .achieved-check .fa-check', function () {
            // Get the clicked checkbox element
            const $chk = $(this);
            // Get the closest ancestor with the class '.achievement'
            const $parent = $chk.closest('.achievement');
            // Retrieve achievement data associated with the clicked element
            const achievement = $parent.data('achievement');
            // Find the category of the achievement by traversing up to the nearest 'section' element and extracting the category data
            const category = $parent.closest('section').find('.header').data('category');
            // Determine whether the achievement is being marked as achieved or not
            const isAchieved = !$chk.hasClass('achieved');
            // Find headers with '.name' elements matching the achievement's category name
            const $h = $headers.filter(function () {
                return $(this).find('.name').text() === achievement.category;
            });

            // Update achievement-related data based on the achieved status
            if (isAchieved) {
                achievement.achieved++; // Increment the achieved count for the achievement
                category.achieved++; // Increment the achieved count for the category
                totalAchieved++; // Increment the overall total achieved count
                achieved.push(achievement.code); // Add the achievement code to the 'achieved' array
            } else {
                achievement.achieved--; // Decrement the achieved count for the achievement
                category.achieved--; // Decrement the achieved count for the category
                totalAchieved--; // Decrement the overall total achieved count

                // Remove the achievement code from the 'achieved' array
                const idx = achieved.indexOf(achievement.code);
                if (idx !== -1) {
                    achieved.splice(idx, 1);
                }
            }

            // Calculate the achievement percentage for the category and update related UI elements
            const percent = Math.floor(category.achieved / category.total * 100);
            $h.find('.progress-bar').attr('aria-valuenow', percent).css('width', percent + '%');
            $h.find('.progress-number .percentage').text(percent + '%');
            $h.find('.progress-number .count').text(`(${category.achieved}/${category.total})`);

            // Toggle the 'achieved' class on the checkbox and parent elements
            $chk.toggleClass('achieved', isAchieved);
            $parent.toggleClass('achieved', achievement.total === achievement.achieved);
            $h.toggleClass('achieved', category.achieved === achievement.total);

            // Update the displayed text for the total achieved count
            $totalAchieved.text(`(${totalAchieved}/${totalAchievements})`);

            // Store the updated 'achieved' array in local storage
            app.localStorage.set('achievements', achieved.join());
        });

        // Attach a change event handler to the "hide-achieved" checkbox
        $('#hide-achieved').on('change', function () {
            const hideAchieved = $(this).is(':checked');
            $list.toggleClass('hide-achieved', hideAchieved);
            app.localStorage.set('hide-achieved', hideAchieved);
        });

        // If the "hide-achieved" setting was stored in local storage, restore it
        if (app.localStorage.get('hide-achieved')) {
            $('#hide-achieved').prop('checked', true).change();
        }

        // Attach a click event handler to the "reset" button
        $('#reset').on('click', function (e) {
            e.preventDefault();
            app.localStorage.set('achievements', '');
            window.location.reload(true)
        });

        // Attach a resize event handler to adjust element heights when the window is resized
        $(window).on('resize', () => {
            const offset = 300;
            const newHeight = Math.max(500, window.innerHeight - offset);
            $categories.css('height', newHeight);
            $list.css('height', newHeight - 31);
        }).trigger('resize');
    });