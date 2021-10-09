app.require(['characters', 'elements', 'resources', 'character-ascension', 'character-level', 'character-talent-level-up'],
    function (characters, elements, resources, characterAscension, characterLevel, characterTalentLeventUp) {

        var sortOrder = {
            "Mora": 0,
            "Wanderer's Advice": 1,
            "Adventurer's Experience": 2,
            "Hero's Wit": 3,
            "Brilliant Diamond Sliver": 7,
            "Brilliant Diamond Fragment": 8,
            "Brilliant Diamond Chunk": 9,
            "Brilliant Diamond Gemstone": 10,
            "Agnidus Agate Sliver": 11,
            "Agnidus Agate Fragment": 12,
            "Agnidus Agate Chunk": 13,
            "Agnidus Agate Gemstone": 14,
            "Varunada Lazurite Sliver": 15,
            "Varunada Lazurite Fragment": 16,
            "Varunada Lazurite Chunk": 17,
            "Varunada Lazurite Gemstone": 18,
            "Vajrada Amethyst Sliver": 19,
            "Vajrada Amethyst Fragment": 20,
            "Vajrada Amethyst Chunk": 21,
            "Vajrada Amethyst Gemstone": 22,
            "Vayuda Turquoise Sliver": 23,
            "Vayuda Turquoise Fragment": 24,
            "Vayuda Turquoise Chunk": 25,
            "Vayuda Turquoise Gemstone": 26,
            "Shivada Jade Sliver": 27,
            "Shivada Jade Fragment": 28,
            "Shivada Jade Chunk": 29,
            "Shivada Jade Gemstone": 30,
            "Prithiva Topaz Sliver": 31,
            "Prithiva Topaz Fragment": 32,
            "Prithiva Topaz Chunk": 33,
            "Prithiva Topaz Gemstone": 34,
            "Hurricane Seed": 35,
            "Lightning Prism": 36,
            "Basalt Pillar": 37,
            "Crystalline Bloom": 38,
            "Smoldering Pearl": 39,
            "Dew of Repudiation": 40,
            "Hoarfrost Core": 41,
            "Everflame Seed": 42,
            "Cleansing Heart": 43,
            "Juvenile Jade": 44,
            "Marionette Core": 45,
            "Perpetual Heart": 46,
            "Storm Beads": 47,
            "Amakumo Fruit": 48,
            "Calla Lily": 49,
            "Cecilia": 50,
            "Cor Lapis": 51,
            "Crystal Marrow": 52,
            "Dandelion Seed": 53,
            "Dendrobium": 54,
            "Glaze Lily": 55,
            "Jueyun Chili": 56,
            "Naku Weed": 57,
            "Noctilucous Jade": 58,
            "Onikabuto": 59,
            "Philanemo Mushroom": 60,
            "Qingxin": 61,
            "Sakura Bloom": 62,
            "Sango Pearl": 63,
            "Sea Ganoderma": 64,
            "Silk Flower": 65,
            "Small Lamp Grass": 66,
            "Starconch": 67,
            "Valberry": 68,
            "Violetgrass": 69,
            "Windwheel Aster": 70,
            "Wolfhook": 71,
            "Teachings of Freedom": 72,
            "Guide to Freedom": 73,
            "Philosophies of Freedom": 74,
            "Teachings of Resistance": 75,
            "Guide to Resistance": 76,
            "Philosophies of Resistance": 77,
            "Teachings of Ballad": 78,
            "Guide to Ballad": 79,
            "Philosophies of Ballad": 80,
            "Teachings of Prosperity": 81,
            "Guide to Prosperity": 82,
            "Philosophies of Prosperity": 83,
            "Teachings of Diligence": 84,
            "Guide to Diligence": 85,
            "Philosophies of Diligence": 86,
            "Teachings of Gold": 87,
            "Guide to Gold": 88,
            "Philosophies of Gold": 89,
            "Teachings of Transience": 90,
            "Guide to Transience": 91,
            "Philosophies of Transience": 92,
            "Teachings of Elegance": 93,
            "Guide to Elegance": 94,
            "Philosophies of Elegance": 95,
            "Teachings of Light": 96,
            "Guide to Light": 97,
            "Philosophies of Light": 98,
            "Slime Condensate": 99,
            "Slime Secretions": 100,
            "Slime Concentrate": 101,
            "Damaged Mask": 102,
            "Stained Mask": 103,
            "Ominous Mask": 104,
            "Divining Scroll": 105,
            "Sealed Scroll": 106,
            "Forbidden Curse Scroll": 107,
            "Firm Arrowhead": 108,
            "Sharp Arrowhead": 109,
            "Weathered Arrowhead": 110,
            "Heavy Horn": 111,
            "Black Bronze Horn": 112,
            "Black Crystal Horn": 113,
            "Dead Ley Line Branch": 114,
            "Dead Ley Line Leaves": 115,
            "Ley Line Sprout": 116,
            "Chaos Device": 117,
            "Chaos Circuit": 118,
            "Chaos Core": 119,
            "Mist Grass Pollen": 120,
            "Mist Grass": 121,
            "Mist Grass Wick": 122,
            "Hunter's Sacrificial Knife": 123,
            "Agent's Sacrificial Knife": 124,
            "Inspector's Sacrificial Knife": 125,
            "Recruit's Insignia": 126,
            "Sergeant's Insignia": 127,
            "Lieutenant's Insignia": 128,
            "Treasure Hoarder Insignia": 129,
            "Silver Raven Insignia": 130,
            "Golden Raven Insignia": 131,
            "Whopperflower Nectar": 132,
            "Shimmering Nectar": 133,
            "Energy Nectar": 134,
            "Fragile Bone Shard": 135,
            "Sturdy Bone Shard": 136,
            "Fossilized Bone Shard": 137,
            "Old Handguard": 138,
            "Kageuchi Handguard": 139,
            "Famed Handguard": 140,
            "Chaos Gear": 141,
            "Chaos Axis": 142,
            "Chaos Oculus": 143,
            "Dismal Prism": 144,
            "Crystal Prism": 145,
            "Polarizing Prism": 146,
            "Spectral Husk": 147,
            "Spectral Heart": 148,
            "Spectral Nucleus": 149,
            "Dvalin's Plume": 150,
            "Dvalin's Claw": 151,
            "Dvalin's Sigh": 152,
            "Tail of Boreas": 153,
            "Ring of Boreas": 154,
            "Spirit Locket of Boreas": 155,
            "Tusk of Monoceros Caeli": 156,
            "Shard of a Foul Legacy": 157,
            "Shadow of the Warrior": 158,
            "Dragon Lord's Crown": 159,
            "Bloodjade Branch": 160,
            "Gilded Scale": 161,
            "Molten Moment": 162,
            "Hellfire Butterfly": 163,
            "Ashen Heart": 164,
            "Crown of Insight": 165
        };

        app.sortByCharacters(characters);

        const wanderersAdvice = app.getByName(resources, "Wanderer's Advice");
        const adventurersExperience = app.getByName(resources, "Adventurer's Experience");
        const herosWit = app.getByName(resources, "Hero's Wit");
        const totalRequirements = {};

        app.calculateRequiredResources = (name, stat, current, goal) => {
            if (!app.getCharacter(name)) return;

            let needs;

            if (stat === 'level') {
                if (name.startsWith('Traveler ')) name = "Traveler";
                const ascension = app.cloneByName(characterAscension, name);
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
                const talentLevelUp = app.cloneByName(characterTalentLeventUp, name);
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
    });