app.require(['characters', 'elements', 'resources', 'character-ascension', 'character-talent-level-up'],
    function (characters, elements, resources, characterAscension, characterTalentLeventUp) {

        var sortOrder = {
            "Mora": 0,
            "Wanderer's Advice": 1,
            "Adventurer's Experience": 2,
            "Hero's Wit": 3,
            "Brilliant Diamond Sliver": 4,
            "Brilliant Diamond Fragment": 5,
            "Brilliant Diamond Chunk": 6,
            "Brilliant Diamond Gemstone": 7,
            "Agnidus Agate Sliver": 8,
            "Agnidus Agate Fragment": 9,
            "Agnidus Agate Chunk": 10,
            "Agnidus Agate Gemstone": 11,
            "Varunada Lazurite Sliver": 12,
            "Varunada Lazurite Fragment": 13,
            "Varunada Lazurite Chunk": 14,
            "Varunada Lazurite Gemstone": 15,
            "Vajrada Amethyst Sliver": 16,
            "Vajrada Amethyst Fragment": 17,
            "Vajrada Amethyst Chunk": 18,
            "Vajrada Amethyst Gemstone": 19,
            "Vayuda Turquoise Sliver": 20,
            "Vayuda Turquoise Fragment": 21,
            "Vayuda Turquoise Chunk": 22,
            "Vayuda Turquoise Gemstone": 23,
            "Shivada Jade Sliver": 24,
            "Shivada Jade Fragment": 25,
            "Shivada Jade Chunk": 26,
            "Shivada Jade Gemstone": 27,
            "Prithiva Topaz Sliver": 28,
            "Prithiva Topaz Fragment": 29,
            "Prithiva Topaz Chunk": 30,
            "Prithiva Topaz Gemstone": 31,
            "Hurricane Seed": 32,
            "Lightning Prism": 33,
            "Basalt Pillar": 34,
            "Crystalline Bloom": 35,
            "Smoldering Pearl": 36,
            "Hoarfrost Core": 37,
            "Everflame Seed": 38,
            "Cleansing Heart": 39,
            "Juvenile Jade": 40,
            "Marionette Core": 41,
            "Perpetual Heart": 42,
            "Amakumo Fruit": 43,
            "Calla Lily": 44,
            "Cecilia": 45,
            "Cor Lapis": 46,
            "Crystal Marrow": 47,
            "Dandelion Seed": 48,
            "Dendrobium": 49,
            "Glaze Lily": 50,
            "Jueyun Chili": 51,
            "Naku Weed": 52,
            "Noctilucous Jade": 53,
            "Onikabuto": 54,
            "Philanemo Mushroom": 55,
            "Qingxin": 56,
            "Sakura Bloom": 57,
            "Sango Pearl": 58,
            "Sea Ganoderma": 59,
            "Silk Flower": 60,
            "Small Lamp Grass": 61,
            "Starconch": 62,
            "Valberry": 63,
            "Violetgrass": 64,
            "Windwheel Aster": 65,
            "Wolfhook": 66,
            "Teachings of Freedom": 67,
            "Guide to Freedom": 68,
            "Philosophies of Freedom": 69,
            "Teachings of Resistance": 70,
            "Guide to Resistance": 71,
            "Philosophies of Resistance": 72,
            "Teachings of Ballad": 73,
            "Guide to Ballad": 74,
            "Philosophies of Ballad": 75,
            "Teachings of Prosperity": 76,
            "Guide to Prosperity": 77,
            "Philosophies of Prosperity": 78,
            "Teachings of Diligence": 79,
            "Guide to Diligence": 80,
            "Philosophies of Diligence": 81,
            "Teachings of Gold": 82,
            "Guide to Gold": 83,
            "Philosophies of Gold": 84,
            "Teachings of Transience": 85,
            "Guide to Transience": 86,
            "Philosophies of Transience": 87,
            "Teachings of Elegance": 88,
            "Guide to Elegance": 89,
            "Philosophies of Elegance": 90,
            "Teachings of Light": 91,
            "Guide to Light": 92,
            "Philosophies of Light": 93,
            "Slime Condensate": 94,
            "Slime Secretions": 95,
            "Slime Concentrate": 96,
            "Damaged Mask": 97,
            "Stained Mask": 98,
            "Ominous Mask": 99,
            "Divining Scroll": 100,
            "Sealed Scroll": 101,
            "Forbidden Curse Scroll": 102,
            "Firm Arrowhead": 103,
            "Sharp Arrowhead": 104,
            "Weathered Arrowhead": 105,
            "Heavy Horn": 106,
            "Black Bronze Horn": 107,
            "Black Crystal Horn": 108,
            "Dead Ley Line Branch": 109,
            "Dead Ley Line Leaves": 110,
            "Ley Line Sprout": 111,
            "Chaos Device": 112,
            "Chaos Circuit": 113,
            "Chaos Core": 114,
            "Mist Grass Pollen": 115,
            "Mist Grass": 116,
            "Mist Grass Wick": 117,
            "Hunter's Sacrificial Knife": 118,
            "Agent's Sacrificial Knife": 119,
            "Inspector's Sacrificial Knife": 120,
            "Recruit's Insignia": 121,
            "Sergeant's Insignia": 122,
            "Lieutenant's Insignia": 123,
            "Treasure Hoarder Insignia": 124,
            "Silver Raven Insignia": 125,
            "Golden Raven Insignia": 126,
            "Whopperflower Nectar": 127,
            "Shimmering Nectar": 128,
            "Energy Nectar": 129,
            "Fragile Bone Shard": 130,
            "Sturdy Bone Shard": 131,
            "Fossilized Bone Shard": 132,
            "Old Handguard": 133,
            "Kageuchi Handguard": 134,
            "Famed Handguard": 135,
            "Chaos Gear": 136,
            "Chaos Axis": 137,
            "Chaos Oculus": 138,
            "Dismal Prism": 139,
            "Crystal Prism": 140,
            "Polarizing Prism": 141,
            "Dvalin's Plume": 142,
            "Dvalin's Claw": 143,
            "Dvalin's Sigh": 144,
            "Tail of Boreas": 145,
            "Ring of Boreas": 146,
            "Spirit Locket of Boreas": 147,
            "Tusk of Monoceros Caeli": 148,
            "Shard of a Foul Legacy": 149,
            "Shadow of the Warrior": 150,
            "Dragon Lord's Crown": 151,
            "Bloodjade Branch": 152,
            "Gilded Scale": 153,
            "Crown of Insight": 154
        };

        characters.sort(app.sortBy('name'));
        characters.sort(app.sortBy('rarity', true));
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
            } else {
                const talentLevelUp = app.cloneByName(characterTalentLeventUp, name);
                if (!talentLevelUp) return;

                needs = talentLevelUp.levels.filter((level) => {
                    return level.min_level >= current && level.min_level < goal;
                });
            }

            return app.sumCountByName.apply(null, needs.map((need) => need.materials));
        };

        app.renderMaterials = ($container, materials) => {
            $container.empty()
            materials.sort((a, b) => {
                const aIdx = sortOrder[a.name] || 0;
                const bIdx = sortOrder[b.name] || 0;

                return aIdx - bIdx;
            });

            materials.forEach((mat) => {
                $container.append($(`<div class="d-inline-block"></div>`).append(app.makeCountCard(mat.name, mat.count)));
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
                        currentAscended: true,
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

                if (selection.selected) {
                    const nameId = selection.name.replace(' ', '-');
                    const $tr = $(`<tr data-resource-name="${character.name}" data-resource-rarity="${character.rarity}"></tr>`);

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
                      ${ character.name.startsWith('Traveler ') && character.name !== 'Traveler (Anemo)' ? '' : `<thead>
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
                        ${selection.talents.map((talent) => {
                            var constellation = talent.constellation ? 'constellation-' + talent.constellation : '';
                        return `<tr>
                            <td>
                              <label>${talent.name}</label>
                            </td>
                            <td>
                              <input class="current-level talent-level form-control form-control-sm ${constellation}" type="number" placeholder="Current" aria-label="Current talent level" min="1" max="10" step="1" value="${talent.currentLvl}" />
                            </td>
                            <td>
                              <input class="goal-level talent-level form-control form-control-sm ${constellation}" type="number" placeholder="Goal" aria-label="Talent level goal" min="1" max="10" step="1" value="${talent.goalLvl}" />
                            </td>
                          </tr>`;
                    }).join('')}
                        </tr>
                      </tbody>
                    </table>
                  </td>`));

                    $tr.append('<td class="level-requirement-table"></td>');
                    $calculatorTable.append($tr);

                    $('tr[data-resource-name]', $calculatorTable).sort(function (a, b) {
                        var aname = $(a).attr('data-resource-name');
                        var bname = $(b).attr('data-resource-name');
                        return aname < bname ? -1 :
                            aname === bname ? 0 : 1;
                    }).sort((a, b) => {
                        var ararity = $(a).attr('data-resource-rarity');
                        var brarity = $(b).attr('data-resource-rarity');
                        return ararity < brarity ? 1 :
                            ararity === brarity ? 0 : -1;
                    }).prependTo($calculatorTable);

                    disableAscendedCheck($('.current-level.character-level', $tr));
                    disableAscendedCheck($('.goal-level.character-level', $tr));
                    $(':input', $tr).eq(0).change();
                } else {
                    $(`tr[data-resource-name="${selection.name}"]`, $calculatorTable).remove();
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
            const selection = app.getByName(app.selections, $card.attr('data-resource-name'));

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
            const selection = app.getByName(app.selections, $tr.attr('data-resource-name'));

            let requirements = [];

            $('.goal-level', $tr).each(function () {
                const $tr = $(this).closest('tr');
                const stat = $('td:first-child', $tr).text().trim() ? 'talent' : 'level';
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
        const $characterSelectContainer = $('td', $characterSelectTable);

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
                if (selection.name) {
                    if (selection.selected) {
                        selection.selected = false;
                        $(`[data-resource-name="${selection.name}"]`, $characterSelectContainer).click();
                    }
                }
            });
        } else {
            app.selections = [];
        }
    });