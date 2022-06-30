app.require(['characters', 'elements', 'resources', 'character-ascension', 'character-level', 'character-talent-level-up'],
    function (characters, elements, resources, characterAscension, characterLevel, characterTalentLeventUp) {

        var sortOrder = resources.reduce((a, r, i) => {
            if (['Common Currency',
                    'Character EXP Material',
                    'Character Ascension Materials',
                    'Boss Material',
                    'Local Specialties',
                    'Talent Level-Up Material',
                    'Common Ascension Materials',
                    'Elite Boss Material',
                    'Limited-duration Event Materials'
                ].indexOf(r.type) !== -1) {
                a[r.name] = i;
            }
            return a;
        }, {});

        app.sortByCharacters(characters);

        const wanderersAdvice = app.getByName(resources, "Wanderer's Advice");
        const adventurersExperience = app.getByName(resources, "Adventurer's Experience");
        const herosWit = app.getByName(resources, "Hero's Wit");
        const totalRequirements = {};

        let characterAscensionCache = {};
        const getCharacterAscension = (name) => {
            if (!name) return;
            if (characterAscensionCache[name]) return characterAscensionCache[name];

            let ascension = app.getBy(characterAscension, (a) => a.object_type === 'ascension-phases');
            let materials = app.getBy(characterAscension, (a) => a.object_type === 'ascension-materials' && a.name === name);
            if (ascension && materials) {
                ascension = app.clone(ascension);
                ascension.phases.forEach((p) => {
                    p.materials.forEach((m) => {
                        var mat = app.getBy(materials.materials, (x) => x.type === m.type && x.rarity === m.rarity);
                        if (mat) {
                            m.name = mat.name;
                        }
                    });
                });
            }
            characterAscensionCache[name] = ascension;
            return ascension;
        };

        let characterTalentLeventUpCache = {};
        const getCharacterTalentLeventUp = (name) => {
            if (!name) return;
            if (characterTalentLeventUpCache[name]) return characterTalentLeventUpCache[name];

            let talentLevelUp = app.getBy(characterTalentLeventUp, (l) => l.object_type === 'talent-level-up-levels');
            let materials = app.getBy(characterTalentLeventUp, (m) => m.object_type === 'talent-level-up-materials' && m.name === name);

            if (name.startsWith('Traveler')) return materials;

            if (talentLevelUp && materials) {
                talentLevelUp = app.clone(talentLevelUp);
                talentLevelUp.levels.forEach((l) => {
                    l.materials.forEach((m) => {
                        var mat = app.getBy(materials.materials, (x) => x.type === m.type && x.rarity === m.rarity);
                        if (mat) {
                            m.name = mat.name;
                        }
                    });
                });
            }
            characterTalentLeventUpCache[name] = talentLevelUp;
            return talentLevelUp;
        };

        app.calculateRequiredResources = (name, stat, current, goal) => {
            if (!app.getCharacter(name)) return;

            let needs;

            if (stat === 'level') {
                if (name.startsWith('Traveler ')) name = "Traveler";
                const ascension = getCharacterAscension(name);
                if (!ascension) return;

                needs = ascension.phases.filter((phase) => {
                    return phase.min_level >= current && phase.min_level < goal;
                });

                // Required experience points
                const totalExpNeeded = characterLevel.filter((level) => level.level >= Math.floor(current) && level.level < Math.floor(goal))
                    .reduce((acc, level) => acc + level.to_next, 0);

                needs.push({
                    object_type: 'character-experience-material',
                    materials: [{
                        name: 'Experience Materials',
                        count: totalExpNeeded
                    }]
                });
            } else {
                const talentLevelUp = getCharacterTalentLeventUp(name);
                if (!talentLevelUp) return;

                const levels = stat === 'Normal Attack' && talentLevelUp.normal_attack_levels || talentLevelUp.levels;
                needs = levels.filter((level) => {
                    return level.min_level >= current && level.min_level < goal;
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
                [herosWit, adventurersExperience, wanderersAdvice].forEach((exp, idx) => {
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
                const _addCard = addCard.bind(this, $container, mat.name, mat.count);
                window.requestAnimationFrame(_addCard);
            });
        };

        // Update total requirements for all characters
        const $totalRequirements = $('.total-level-requirement-table');
        app.updateTotalRequirements = app.debounce(() => {
            const allTotalRequirements = app.sumCountByName.apply(null, Object.keys(totalRequirements).map((name) => totalRequirements[name]));
            app.renderMaterials($totalRequirements, allTotalRequirements);
        }, 500);

        const $characterSelectTable = $('#calculator-character-select-table');
        const $calculatorTable = $('#level-up-resource-calculator-table tbody');

        // Handle show hide
        $('thead .show-toggle', $characterSelectTable).on('change', function () {
            const $toggle = $(this);
            const isChecked = $toggle.is(':checked');
            let type = $toggle.attr('data-type');

            if (type) {
                $(`.card-container[data-resource-element="${type}"]`, $characterSelectTable).each(function () {
                    $(this).parent().toggleClass('d-none', !isChecked);
                });
                app.shown[type] = isChecked;
                app.localStorage.set('calculator-characters-shown', app.shown);
            }
        });

        // Handle character selection
        $characterSelectTable.on('click keyup', '.card-container', function (evt) {
            if (evt.type === 'keyup' && !(evt.code === 'Space' || evt.code === 'Enter')) return;
            evt.preventDefault();

            const $this = $(this);
            const character = $this.data('resource') || {};
            if (character) {
                let selection = app.getByName(app.selections, character.name);
                if (!selection) {
                    selection = {
                        name: character.name,
                        selected: false,
                        currentLvl: 1,
                        currentAscended: false,
                        goalLvl: 90,
                        goalAscended: true,
                        constellation: 0,
                        talents: []
                    };
                    character.talents.forEach((talent) => {
                        if (['Normal Attack', 'Elemental Skill', 'Elemental Burst'].indexOf(talent.type) === -1) return;

                        selection.talents.push({
                            name: talent.name,
                            currentLvl: 1,
                            goalLvl: 10,
                            constellation: talent.constellation
                        });
                    });
                    app.selections.push(selection);

                    app.selections.sort(app.sortByName);
                }
                selection.selected = !selection.selected;
                app.localStorage.set('calculator-characters', app.selections);

                $this.toggleClass('selected', selection.selected);

                const nameId = app.id(selection.name);
                if (selection.selected) {
                    const $tr = $(`<tr data-resource-id="${character.id}"></tr>`)
                        .data('resource', character);

                    const $card = app.makeCharacterCard(character.name);
                    $tr.append($('<td></td>')
                        .append($card)
                        .append(`
<div class="form-group mx-auto" style="width: 74px;">
    <label style="font-size: .8em;">
        Constellation
    </label>
    <input class="character-constellation form-control form-control-sm" type="number" placeholder="Constellation" aria-label="Character constellation level" min="0" max="6" step="1" value="${selection.constellation}" data-current-value="0" />
</div>`));

                    $tr.append($(`<td style="padding: 0;">
                    <table class="calculate-level-table table table-bordered table-striped align-middle mb-0">
                      ${character.name.startsWith('Traveler ') && character.name !== 'Traveler (Anemo)' ? '' : `<thead>
                        <tr>
                          <th scope="col" style="width: 90px">Level</th>
                          <th scope="col" style="width: 90px">Current</th>
                          <th scope="col" style="width: 90px">Goal</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                          </td>
                          <td>
                            <input class="current-level character-level form-control form-control-sm" type="number" placeholder="Current" aria-label="Current level" min="1" max="90" step="1" value="${selection.currentLvl}" />
                            <div class="form-check text-start ms-1">
                              <input class="form-check-input current-ascended" type="checkbox" id="current-ascended-${nameId}" ${selection.currentAscended ? "checked" : ""} />
                              <label class="form-check-label" for="current-ascended-${nameId}">
                                Ascended
                              </label>
                            </div>
                          </td>
                          <td>
                            <input class="goal-level character-level form-control form-control-sm" type="number" placeholder="Goal" aria-label="Character level goal" min="1" max="90" step="1" value="${selection.goalLvl}" />
                            <div class="form-check text-start ms-1">
                              <input class="form-check-input goal-ascended" type="checkbox" value="" id="goal-ascended-${nameId}" ${selection.goalAscended ? "checked" : ""} />
                              <label class="form-check-label" for="goal-ascended-${nameId}">
                                Ascended
                              </label>
                            </div>
                          </td>
                        </tr>`}
                        <tr>
                          <th scope="col">Talents</th>
                          <th scope="col">Current</th>
                          <th scope="col">Goal</th>
                        </tr>
                        ${selection.talents.map((t) => {
                            var talent = app.getByName(character.talents, t.name);
                            var constellation = talent.constellation ? 'constellation-' + talent.constellation : '';
                        return `<tr data-talent-type="${talent.type}">
                            <td>
                              <label>${talent.name}</label>
                            </td>
                            <td>
                              <input class="current-level talent-level form-control form-control-sm ${constellation}" type="number" placeholder="Current" aria-label="Current talent level" min="1" max="10" step="1" value="${t.currentLvl}" />
                            </td>
                            <td>
                              <input class="goal-level talent-level form-control form-control-sm ${constellation}" type="number" placeholder="Goal" aria-label="Talent level goal" min="1" max="10" step="1" value="${t.goalLvl}" />
                            </td>
                          </tr>`;
                    }).join('')}
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

        // handle constellation change
        $calculatorTable.on('change', '.character-constellation', function () {
            const $this = $(this);
            const constellation = $this.val();
            const $card = $('.card-container', $this.closest('td'));
            const selection = app.getByName(app.selections, $card.data('resource').name);

            var previousConstellation = +$this.attr('data-current-value') || 0;
            selection.constellation = constellation >= 0 || constellation <= 6 ? constellation : 0;
            $this.attr('data-current-value', selection.constellation);

            var $lvlTable = $this.closest('tr').find('.calculate-level-table');

            $lvlTable.removeClass('constellation-0 constellation-1 constellation-2 constellation-3 constellation-4 constellation-5 constellation-6')
                .addClass('constellation-' + selection.constellation);

            let change = previousConstellation < 3 && selection.constellation >= 3 ? 3 :
                previousConstellation >= 3 && selection.constellation < 3 ? -3 : 0;

            if (change !== 0) {
                $('.constellation-3', $lvlTable).each(function () {
                    const $this = $(this).attr('min', change === 3 ? 4 : 1)
                        .attr('max', change === 3 ? 13 : 10);
                    $this.val(+$this.val() + change)
                });
            }

            change = previousConstellation < 5 && selection.constellation >= 5 ? 3 :
                previousConstellation >= 5 && selection.constellation < 5 ? -3 : 0;

            if (change !== 0) {
                $('.constellation-5', $lvlTable).each(function () {
                    const $this = $(this).attr('min', change === 3 ? 4 : 1)
                        .attr('max', change === 3 ? 13 : 10);
                    $this.val(+$this.val() + change)
                });
            }
            app.localStorage.set('calculator-characters', app.selections);
            $(':input', $lvlTable).eq(0).change()
        });

        const disableAscendedCheck = ($input) => {
            const lvl = +$input.val();

            $('.current-ascended, .goal-ascended', $input.next()).prop('disabled', lvl <= 0 || lvl >= 90 || lvl % 10 > 0);
        };
        // Handle character ascended disabled/enabled
        $calculatorTable.on('change', '.character-level', function () {
            disableAscendedCheck($(this));
        });

        // handle level change
        $calculatorTable.on('change', '.calculate-level-table :input', function () {
            const $tr = $(this).closest('.calculate-level-table').closest('tr');
            const selection = app.getByName(app.selections, $tr.data('resource').name);

            let requirements = [];

            $('.goal-level', $tr).each(function () {
                const $tr = $(this).closest('tr');
                const stat = $tr.attr('data-talent-type') ? $tr.attr('data-talent-type') : 'level';
                let current = +$('.current-level', $tr).val() || 0;
                let goal = +$('.goal-level', $tr).val() || 0;
                const currentAscended = $('.current-ascended', $tr).is(':checked');
                const goalAscended = $('.goal-ascended', $tr).is(':checked');

                if (stat === 'level') {
                    selection.currentLvl = +current || 0;
                    selection.currentAscended = !!currentAscended;
                    selection.goalLvl = +goal || 0;
                    selection.goalAscended = !!goalAscended;
                } else {
                    const talent = app.getByName(selection.talents, $('td:first-child', $tr).text().trim());
                    if (talent) {
                        if (selection.constellation >= talent.constellation) {
                            current -= 3;
                            goal -= 3;
                        }

                        talent.currentLvl = +current || 0;
                        talent.goalLvl = +goal || 0;
                    }
                }

                if (stat &&
                    current && !isNaN(+current) &&
                    goal && !isNaN(+goal) &&
                    +current <= +goal) {
                    const needs = app.calculateRequiredResources(selection.name, stat,
                        stat === 'level' && currentAscended ? +current + 0.5 : +current,
                        stat === 'level' && goalAscended ? +goal + 0.5 : +goal);

                    requirements.push(needs);
                }
            });

            requirements = app.sumCountByName.apply(null, requirements);

            app.renderMaterials($('.level-requirement-table', $tr), requirements);
            app.localStorage.set('calculator-characters', app.selections);

            // Update total requirements for all characters
            totalRequirements[selection.name] = requirements;
            app.updateTotalRequirements();
        });

        // Fill selection table with character cards
        const $characterSelectContainer = $('tbody td', $characterSelectTable);

        characters.forEach((character) => {
            const $card = app.makeCharacterCard(character.name, true, true);

            if ($card) {
                const $wrapper = $('<div class="d-inline-block mx-1"></div>');
                $wrapper.append($card);
                $characterSelectContainer.append($wrapper);
            }
        });

        // Restore data
        app.selections = app.localStorage.get('calculator-characters');
        if (app.selections && Array.isArray(app.selections)) {
            app.selections.sort(app.sortByName);

            app.selections.forEach((selection) => {
                if (selection.name && selection.selected) {
                    selection.selected = false;
                    $(`[data-resource-id="${app.id(selection.name)}"]`, $characterSelectContainer).click();
                }
            });
        } else {
            app.selections = [];
        }
        app.shown = app.localStorage.get('calculator-characters-shown');
        if (app.shown) {
            Object.keys(app.shown).forEach((key) => {
                if (app.shown[key] === false) {
                    $(`thead .show-toggle[data-type="${key}"]`, $characterSelectTable).click();
                }
            });
        } else {
            app.shown = {};
        }

        $('#import').on('click', async () => {
            const options = {
                types: [{
                    description: "GOOD Json",
                    accept: {
                        'application/json': ['.json']
                    }
                }],
                excludeAcceptAllOption: true,
                multiple: false
            };

            const file = await app.getFile(options);
            if (!file) return;

            const json = JSON.parse(await file.text());

            if (json.format === "GOOD")
            {
                app.selections = [];
                json.characters.forEach((gc) => {
                    const name = gc.key.replace(/([a-z])([A-Z])/g, '$1 $2');
                    const character = app.getByName(characters, name);
                    if (!character) return;

                    let selection = app.getByName(app.selections, name);
                    if (!selection) {
                        selection = {
                            name: name,
                            selected: false,
                            currentLvl: gc.level,
                            currentAscended: false, /// TODO
                            goalLvl: 90,
                            goalAscended: true,
                            constellation: gc.constellation,
                            talents: []
                        };

                        character.talents.forEach((talent) => {
                            const type2good = {
                                'Normal Attack': 'auto',
                                'Elemental Skill': 'skill',
                                'Elemental Burst': 'burst'
                            };
                            if (!type2good[talent.type])
                                return;

                            selection.talents.push({
                                name: talent.name,
                                currentLvl: gc.talent[type2good[talent.type]],
                                goalLvl: 9,
                                constellation: talent.constellation
                            });
                        });
                        app.selections.push(selection);
                        app.selections.sort(app.sortByName);
                    }
                    selection.selected = false;
                    $(`[data-resource-id="${app.id(name)}"]`, $characterSelectContainer).click();
                });
            }
        });

        $('#unselectAll').on('click', () => {
            app.selections.forEach((selection) => {
                $(`[data-resource-id="${app.id(selection.name)}"]`, $characterSelectContainer).click();
            });
        });
    });
