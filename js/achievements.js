app.require(['achievements'],
    function (achievements) {
        const $categories = $('#achievement-category');
        const $list = $('#achievement-list');
        const $totalAchieved = $('.total-achieved');
        const savedAchievement = (app.localStorage.get('achievements') || '').split(',').filter((a) => !!a);
        const achieved = [];
        let totalAchieved = 0;
        const categories = achievements.map((a) => {
                // Set total count of actual achievements (1 or 3)
                a.total = 1;
                if (Array.isArray(a.reward)) {
                    a.total = a.reward.length;
                }
                // Generate unique code
                a.code = app.generateCode(a.name);
                // Restored achieved state
                a.achieved = 0;
                var savedIdx
                while ((savedIdx = savedAchievement.indexOf(a.code)) !== -1) {
                    totalAchieved++;
                    a.achieved++;
                    savedAchievement.splice(savedIdx, 1);
                    achieved.push(a.code);
                }

                return a.category;
            })
            .filter((value, index, self) => self.indexOf(value) === index)
            .map((c) => {
                return {
                    name: c,
                    achieved: achievements.filter((a) => a.category === c).reduce((total, a) => total + a.achieved, 0),
                    total: achievements.filter((a) => a.category === c).reduce((total, a) => total + a.total, 0)
                };
            });
        const totalAchievements = categories.reduce((total, c) => total + c.total, 0);
        $totalAchieved.text(`(${totalAchieved}/${totalAchievements})`);

        categories.forEach((c, idx) => {
            const percent = Math.floor(c.achieved / c.total * 100);
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

                $list.append($sublist);
            });
        });

        const $headers = $categories.find('.list-group-item').add($list.find('.header'));

        $list.on('click', '.achievement .achieved-check .fa-check', function () {
            const $chk = $(this);
            const $parent = $chk.closest('.achievement');
            const achievement = $parent.data('achievement');
            const category = $parent.closest('section').find('.header').data('category');
            const isAchieved = !$chk.hasClass('achieved');
            const $h = $headers.filter(function () {
                return $(this).find('.name').text() === achievement.category;
            });

            if (isAchieved) {
                achievement.achieved++;
                category.achieved++;
                totalAchieved++;
                achieved.push(achievement.code);
            } else {
                achievement.achieved--;
                category.achieved--;
                totalAchieved--;

                const idx = achieved.indexOf(achievement.code);
                if (idx !== -1) {
                    achieved.splice(idx, 1);
                }
            }

            const percent = Math.floor(category.achieved / category.total * 100);
            $h.find('.progress-bar').attr('aria-valuenow', percent).css('width', percent + '%');
            $h.find('.progress-number .percentage').text(percent + '%');
            $h.find('.progress-number .count').text(`(${category.achieved}/${category.total})`);

            $chk.toggleClass('achieved', isAchieved);
            $parent.toggleClass('achieved', achievement.total === achievement.achieved);
            $h.toggleClass('achieved', category.achieved === achievement.total)

            $totalAchieved.text(`(${totalAchieved}/${totalAchievements})`);
            app.localStorage.set('achievements', achieved.join());
        });

        $('#hide-achieved').on('change', function () {
            const hideAchieved = $(this).is(':checked');
            $list.toggleClass('hide-achieved', hideAchieved);
            app.localStorage.set('hide-achieved', hideAchieved);
        });

        if (app.localStorage.get('hide-achieved')) {
            $('#hide-achieved').prop('checked', true).change();
        }

        $('#reset').on('click', function (e) {
            e.preventDefault();
            app.localStorage.set('achievements', '');
            window.location.reload(true)
        });

        $(window).on('resize', () => {
            const offset = 300;
            const newHeight = Math.max(500, window.innerHeight - offset);
            $categories.css('height', newHeight);
            $list.css('height', newHeight - 31);
        }).trigger('resize');
    });