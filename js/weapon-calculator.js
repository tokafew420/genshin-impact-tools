app.require(['weapons', 'resources', 'weapon-ascension', 'weapon-level'],
    function (weapons, resources, weaponAscension, weaponLevel) {

        var sortOrder = resources.reduce((a, r, i) => {
            if (['Common Currency',
                'Weapon Enhancement Materials',
                'Common Ascension Materials',
                'Weapon Ascension Materials'].indexOf(r.type) !== -1) {
                a[r.name] = i;
            }
            return a;
        }, {});

        app.sortByCharacters(weapons);

        const enhancementOre = app.getByName(resources, "Enhancement Ore");
        const fineEnhancementOre = app.getByName(resources, "Fine Enhancement Ore");
        const mysticEnhancementOre = app.getByName(resources, "Mystic Enhancement Ore");
        const totalRequirements = {};

        app.calculateRequiredResources = (name, current, goal) => {
            const weapon = app.getWeapon(name);
            if (!weapon) return;

            let needs;

            const ascension = app.cloneByName(weaponAscension, name);
            if (!ascension) return;

            needs = ascension.phases.filter((phase) => {
                return phase.min_level >= current && phase.min_level < goal;
            });

            // Required experience points
            let weaponLevels = app.getBy(weaponLevel, 'rarity', weapon.rarity);
            if (weaponLevels) {
                const totalExpNeeded = weaponLevels.levels.filter((level) => level.level >= Math.floor(current) && level.level < Math.floor(goal))
                    .reduce((acc, level) => {
                        acc.experience += level.to_next;
                        acc.mora += level.mora_to_next;
                        return acc;
                    }, {
                        experience: 0,
                        mora: 0
                    });

                needs.push({
                    object_type: 'weapon-experience-material',
                    materials: [{
                        name: 'Experience Materials',
                        count: totalExpNeeded.experience
                    }, {
                        name: 'Mora',
                        count: totalExpNeeded.mora
                    }]
                });
            }

            return app.sumCountByName.apply(null, needs.map((need) => need.materials));
        };

        function addCard($container, name, count) {
            $container.append($(`<div class="d-inline-block"></div>`).append(app.makeCountCard(name, count)));
        }
        app.renderMaterials = ($container, materials) => {
            var mats = materials.slice(0);
            var experience = app.removeByName(mats, 'Experience Materials');
            if (experience) {
                let expNeeded = experience.count;
                [mysticEnhancementOre, fineEnhancementOre, enhancementOre].forEach((exp, idx) => {
                    let itemCount = Math.floor(expNeeded / exp.points);
                    expNeeded = expNeeded % exp.points;

                    if (idx === 2 && expNeeded > 0) itemCount++;
                    if (itemCount) {
                        mats.push({
                            name: exp.name,
                            count: itemCount
                        });
                    }
                });
            }

            $container.empty();
            mats.sort((a, b) => {
                const aIdx = sortOrder[a.name] || 0;
                const bIdx = sortOrder[b.name] || 0;

                return aIdx - bIdx;
            });

            mats.forEach((mat) => {
                if (mat.count) {
                    const _addCard = addCard.bind(this, $container, mat.name, mat.count);
                    window.requestAnimationFrame(_addCard);
                }
            });
        };

        // Update total requirements for all characters
        const $totalRequirements = $('.total-level-requirement-table');
        app.updateTotalRequirements = app.debounce(() => {
            const allTotalRequirements = app.sumCountByName.apply(null, Object.keys(totalRequirements).map((name) => totalRequirements[name]));
            app.renderMaterials($totalRequirements, allTotalRequirements);
        }, 500);

        const $weaponSelectTable = $('#calculator-weapon-select-table');
        const $calculatorTable = $('#level-up-resource-calculator-table tbody');

        // Handle show hide
        $('thead .show-toggle', $weaponSelectTable).on('change', function () {
            const $toggle = $(this);
            const isChecked = $toggle.is(':checked');
            let type = $toggle.attr('data-type');

            if (type) {
                $(`.card-container[data-resource-type="${type}"]`, $weaponSelectTable).each(function () {
                    $(this).parent().toggleClass('d-none', !isChecked);
                });
                app.shown[type] = isChecked;
                app.localStorage.set('calculator-weapons-shown', app.shown);
            }
        });

        // Handle weapon selection
        $weaponSelectTable.on('click keyup', '.card-container', function (evt) {
            if (evt.type === 'keyup' && !(evt.code === 'Space' || evt.code === 'Enter')) return;
            evt.preventDefault();

            const $this = $(this);
            const weapon = $this.data('resource') || {};
            if (weapon.name) {
                const max = weapon.rarity <= 2 ? 70 : 90;
                let selection = app.getByName(app.selections, weapon.name);
                if (!selection) {
                    selection = {
                        name: weapon.name,
                        selected: false,
                        currentLvl: 1,
                        currentAscended: false,
                        goalLvl: max,
                        goalAscended: true
                    };

                    app.selections.push(selection);
                    app.selections.sort(app.sortByName);
                }
                selection.selected = !selection.selected;
                app.localStorage.set('calculator-weapons', app.selections);

                $this.toggleClass('selected', selection.selected);

                const nameId = app.id(selection.name);
                if (selection.selected) {
                    const $tr = $(`<tr data-resource-id="${nameId}"></tr>`)
                        .data('resource', weapon);

                    const $card = app.makeWeaponCard(weapon.name);
                    $tr.append($('<td></td>').append($card));
                    $tr.append($(`<td style="padding: 0;">
                    <table class="calculate-level-table table table-bordered table-striped align-middle mb-0">
                      <thead>
                        <tr>
                          <th scope="col" style="width: 90px">Current</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <input class="current-level form-control form-control-sm" type="number" placeholder="Current" aria-label="Current level" min="1" max="${max}" step="1" value="${selection.currentLvl}" />
                            <div class="form-check text-start ms-1">
                              <input class="form-check-input weapon-level current-ascended" type="checkbox" id="current-ascended-${nameId}" ${selection.currentAscended ? "checked" : ""} />
                              <label class="form-check-label" for="current-ascended-${nameId}">
                                Ascended
                              </label>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <th scope="col" style="width: 90px">Goal</th>
                        </tr>
                        <tr>
                          <td>
                            <input class="goal-level form-control form-control-sm" type="number" placeholder="Goal" aria-label="Goal level" min="1" max="${max}" step="1" value="${selection.goalLvl}" />
                            <div class="form-check text-start ms-1">
                              <input class="form-check-input weapon-level goal-ascended" type="checkbox" id="goal-ascended-${nameId}" ${selection.goalAscended ? "checked" : ""} />
                              <label class="form-check-label" for="goal-ascended-${nameId}">
                                Ascended
                              </label>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>`));

                    $tr.append('<td class="level-requirement-table"></td>');
                    $calculatorTable.append($tr);

                    app.sortByCharacters($('tr[data-resource-id]', $calculatorTable), (item) => $(item).data('resource'))
                        .prependTo($calculatorTable);

                    disableAscendedCheck($('.current-level.character-level', $tr));
                    disableAscendedCheck($('.goal-level.character-level', $tr));
                    $(':input', $tr).eq(0).change();
                } else {
                    $(`tr[data-resource-id="${nameId}"]`, $calculatorTable).remove();
                    totalRequirements[selection.name] = null;
                    app.updateTotalRequirements();
                }
            }
        });

        // Handle all input changes
        $calculatorTable.on('change', 'input[type="number"]', function () {
            const $this = $(this);
            const val = +$this.val();
            const min = +$this.attr('min');
            const max = +$this.attr('max');
            if (val < min) $this.val(min);
            else if (val > max) $this.val(max);
        });

        const disableAscendedCheck = ($input) => {
            const lvl = +$input.val();

            $('.current-ascended, .goal-ascended', $input.next()).prop('disabled', lvl <= 0 || lvl >= 90 || lvl % 10 > 0);
        };
        // Handle character ascended disabled/enabled
        $calculatorTable.on('change', '.weapon-level', function () {
            disableAscendedCheck($(this));
        });

        // handle level change
        $calculatorTable.on('change', '.calculate-level-table :input', function () {
            const $tr = $(this).closest('.calculate-level-table').closest('tr');
            const selection = app.getByName(app.selections, $tr.data('resource').name);

            let requirements = [];

            $('.goal-level', $tr).each(function () {
                let current = +$('.current-level', $tr).val() || 0;
                let goal = +$('.goal-level', $tr).val() || 0;
                const currentAscended = $('.current-ascended', $tr).is(':checked');
                const goalAscended = $('.goal-ascended', $tr).is(':checked');

                selection.currentLvl = +current || 0;
                selection.currentAscended = !!currentAscended;
                selection.goalLvl = +goal || 0;
                selection.goalAscended = !!goalAscended;

                if (current && !isNaN(+current) &&
                    goal && !isNaN(+goal) &&
                    +current <= +goal) {
                    const needs = app.calculateRequiredResources(selection.name,
                        currentAscended ? +current + 0.5 : +current,
                        goalAscended ? +goal + 0.5 : +goal);

                    requirements.push(needs);
                }
            });

            requirements = app.sumCountByName.apply(null, requirements);

            app.renderMaterials($('.level-requirement-table', $tr), requirements);
            app.localStorage.set('calculator-weapons', app.selections);

            // Update total requirements for all characters
            totalRequirements[selection.name] = requirements;
            app.updateTotalRequirements();
        });

        // Fill selection table with weapon cards
        const $weaponSelectContainer = $('tbody td', $weaponSelectTable);

        weapons.forEach((weapon) => {
            const $card = app.makeWeaponCard(weapon.name, true, true);

            if ($card) {
                const $wrapper = $('<div class="d-inline-block mx-1"></div>');
                $wrapper.append($card);
                $weaponSelectContainer.append($wrapper);
            }
        });

        // Restore data
        app.selections = app.localStorage.get('calculator-weapons');
        if (app.selections && Array.isArray(app.selections)) {
            app.selections.sort(app.sortByName);

            app.selections.forEach((selection) => {
                if (selection.name && selection.selected) {
                    selection.selected = false;
                    $(`[data-resource-id="${app.id(selection.name)}"]`, $weaponSelectContainer).click();
                }
            });
        } else {
            app.selections = [];
        }
        app.shown = app.localStorage.get('calculator-weapons-shown');
        if (app.shown) {
            Object.keys(app.shown).forEach((key) => {
                if (app.shown[key] === false) {
                    $(`thead .show-toggle[data-type="${key}"]`, $weaponSelectTable).click();
                }
            });
        } else {
            app.shown = {};
        }
    });