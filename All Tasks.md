You need to solve 5 problems and submit the finished and working solution as
an archive, an md file, or a link to a public repository on GitHub.
There are no time limits or restrictions on the use of AI tools, but the presence
of explicit hallucination in the code will be a huge disadvantage.

================================================================================

# Task 1 — Widget state recycling in a buffered grid

**Stack:** Ext JS **7.5.0**, **Classic** toolkit, Triton theme.
**Sandbox:** https://fiddle.sencha.com/#view/editor — select `Ext JS 7.5.0 classic triton`,
paste the whole block below into the editor (replace everything), press **Run**.

https://fiddle.sencha.com/#view/editor&fiddle/3uv5

## Context

This is an employee roster — the kind of grid you'll find all over SageHCM. There
are thousands of rows, so the grid only renders what's on screen and reuses a
small pool of button widgets as you scroll. That reuse is where this task lives.

Each row has a "Status" button: it reads `Activate` or `Deactivate` depending on
the employee's `active` flag, it's disabled for `locked` employees, and clicking
it flips that employee's status.

Make the column behave: every visible button should match
its own row at all times, clicking one should flip only that row and update its
button straight away, and nothing should leak between rows.

Please fix the column itself — don't turn off buffered rendering, shrink the
dataset, or rebuild the grid on every change. The whole point is to get it right
*while* the grid keeps recycling widgets.


## Starter code

This is the broken version — paste it over everything in the editor and Run.

```javascript
Ext.application({
    name : 'Fiddle',

    launch : function () {
        // --- generate a large dataset so widgets are recycled on scroll ---
        var departments = ['HR', 'Payroll', 'Engineering', 'Sales', 'Support'],
            data = [],
            i;

        for (i = 1; i <= 1000; i++) {
            data.push({
                id         : i,
                name       : 'Employee ' + i,
                department : departments[i % departments.length],
                active     : (i % 2 === 0),
                locked     : (i % 7 === 0)
            });
        }

        Ext.create('Ext.grid.Panel', {
            title      : 'Employee roster (' + data.length + ' rows)',
            renderTo   : Ext.getBody(),
            height     : 400,
            width      : 700,
            // buffered rendering is on by default for classic grids;
            // only ~visible rows exist, widgets are pooled & recycled.
            store      : {
                fields : ['id', 'name', 'department', 'active', 'locked'],
                data   : data
            },
            columns : [
                { text : 'ID', dataIndex : 'id', width : 60 },
                { text : 'Name', dataIndex : 'name', flex : 1 },
                { text : 'Department', dataIndex : 'department', width : 120 },
                {
                    text      : 'Active',
                    dataIndex : 'active',
                    width     : 80,
                    renderer  : function (v) {
                        return v
                            ? '<span style="color:#2e7d32">yes</span>'
                            : '<span style="color:#999">no</span>';
                    }
                },
                {
                    text      : 'Locked?',
                    dataIndex : 'locked',
                    width     : 80,
                    renderer  : function (v) { return v ? 'Locked' : ''; }
                },

                // ====================================================
                // NAIVE / BROKEN widget column — THIS is what you fix.
                // ====================================================
                {
                    xtype : 'widgetcolumn',
                    text  : 'Status',
                    width : 170,

                    // state is pushed onto the (recycled) widget
                    // asynchronously. By the time the timer fires, the same
                    // widget instance may already serve a DIFFERENT record.
                    onWidgetAttach : function (col, widget, rec) {
                        Ext.defer(function () {
                            widget.setText(rec.get('active') ? 'Deactivate' : 'Activate');
                            widget.setDisabled(!!rec.get('locked'));
                        }, 30);

                        col._lastRecord = rec;
                    },

                    widget : {
                        xtype   : 'button',
                        handler : function () {
                            var col = this.getWidgetColumn(),
                                rec = col._lastRecord;

                            rec.set('active', !rec.get('active'));
                        }
                    }
                }
            ]
        });
    }
});
```

================================================================================

# Task 2 — A custom two-way bindable component (config system)

**Stack:** Ext JS **7.5.0**, **Classic** toolkit, Triton theme.
**Sandbox:** https://fiddle.sencha.com/#view/editor — select `Ext JS 7.5.0 classic triton`,
paste the whole block below, press **Run**.

https://fiddle.sencha.com/#view/editor&fiddle/3uv6

## Context

We reuse a lot of small custom controls across SageHCM forms — things that plug
into MVVM binding and behave just like a built-in field. This task is to build
one of those from scratch: a little star-rating control for, say, a performance
review.

You get a working form to drop it into. It has a ViewModel holding the current
rating (it starts at 2), a `displayfield` that echoes the rating, a Save button
that should stay disabled while the rating is 0, and a "Reset to 5" button that
pushes 5 back through the ViewModel. The form already references
`xtype: 'starrating'`; right now that component is a stub full of `TODO`s — your
job is to make it real.

What it should do:

- show five clickable stars, with the first *n* filled to match the value;
- bind both ways through `bind: '{rating}'`. "Reset to 5" only sets the
  ViewModel, yet it should light up five stars; and clicking the *n*-th star
  should set the value to *n* and update the `displayfield` and the Save button on
  its own, without any extra wiring back in the form;
- keep the value sane — always a whole number between 0 and `maxStars`. Asking for
  7 should land on 5, and -3 on 0;
- not blow up if the value arrives (via config or binding) before the component
  has rendered.


## Starter code

Paste this in and Run; the `starrating` component is the part you fill in.

```javascript
// =========================================================================
//  TODO: implement this component. It must be a proper two-way bindable
//  control built on the Ext JS config system.
// =========================================================================
Ext.define('App.ux.StarRating', {
    extend : 'Ext.Component',
    xtype  : 'starrating',

    config : {
        value    : 0,
        maxStars : 5
    },

    // TODO: make `value` the default bind target and two-way bindable.

    baseCls : 'app-starrating',

    // TODO: applyValue  — normalize/clamp to an integer in [0, maxStars]
    // TODO: updateValue — re-render stars when the value changes (guard render)
    // TODO: render the stars and handle clicks → setValue(n)

});


Ext.application({
    name : 'Fiddle',

    launch : function () {
        Ext.create('Ext.form.Panel', {
            title      : 'Performance review',
            renderTo   : Ext.getBody(),
            width      : 420,
            bodyPadding: 16,

            viewModel : {
                data : { rating : 2 }
            },

            items : [
                {
                    xtype      : 'starrating',
                    fieldLabel : 'Overall rating',   // cosmetic; Component ignores it
                    reference  : 'stars',
                    bind       : '{rating}'
                },
                {
                    xtype  : 'displayfield',
                    margin : '10 0 0 0',
                    bind   : 'You rated: {rating} / 5'
                }
            ],

            buttons : [
                {
                    text    : 'Reset to 5',
                    handler : function (btn) {
                        // VM → component path; don't touch the starrating directly
                        btn.lookupViewModel().set('rating', 5);
                    }
                },
                {
                    text : 'Save',
                    bind : { disabled : '{!rating}' },
                    handler : function (btn) {
                        Ext.Msg.alert('Saved', 'Stored rating = ' + btn.lookupViewModel().get('rating'));
                    }
                }
            ]
        });
    }
});
```

================================================================================

# Task 3 — Reactive timesheet totals & validation (ViewModel)

**Stack:** Ext JS **7.5.0**, **Classic** toolkit, Triton theme.
**Sandbox:** https://fiddle.sencha.com/#view/editor — select `Ext JS 7.5.0 classic triton`,
paste the whole block below, press **Run**.

https://fiddle.sencha.com/#view/editor&fiddle/3uv9

## Context

There's an editable grid of day/project/hours rows that the user edits inline, and
under it a running total and a Save button.

We keep this kind of reactivity in the ViewModel: the view stays declarative, and
the total and the Save button's enabled state are ViewModel formulas — no
hand-rolled DOM updates, no totals computed in the view.

Most of the scaffold is already there: the grid, inline editing, the total bound
to `{totalHours}`, Save bound to `{saveDisabled}`. What isn't right is the
`formulas` block. It holds the obvious first attempt:

```javascript
totalHours: function (get) {
    return get('entries').sum('hours');   // looks fine, but...
}
```

It computes once and then goes stale — edit an `Hours` cell and the total doesn't
move. The reason is worth understanding: the formula's only dependency is the
store *instance*, and that reference doesn't change when you edit a field inside
one of its records. We'd like you to make the formulas track changes *inside* the
records, not just the store reference.

So, as the user edits hours inline:

- the total should update the moment a cell is committed, and when rows are added
  or removed;
- Save should be disabled when the total is 0 (nothing to save), when it goes over
  40 (the weekly cap), or when any row holds invalid hours (`< 0` or `> 24`);
- when Save is enabled and clicked, it should report the committed total.

Keep the total out of the grid and controller — it belongs in a formula.

You'll know it's right when:

- editing an `Hours` cell and pressing Enter/Tab changes the total instantly;
- driving the total to 0, over 40, or putting `30` in one row (invalid, `> 24`)
  disables Save, and bringing it back into range enables it again;
- "Add row" / "Remove selected" also move the total and the Save state.

## Starter code

Paste this in and Run; the `formulas` block is the part to get right.

```javascript
Ext.define('App.TimesheetController', {
    extend : 'Ext.app.ViewController',
    alias  : 'controller.timesheet',

    handleAddRow : function () {
        this.getViewModel().getStore('entries').add({ day : '—', project : 'New', hours : 0 });
    },

    handleRemoveSelected : function () {
        var grid = this.lookup('grid'),
            sel  = grid.getSelection();

        if (sel.length) {
            grid.getStore().remove(sel);
        }
    },

    handleSave : function () {
        Ext.Msg.alert('Saved', 'Submitted ' + this.getViewModel().get('totalHours') + ' h');
    }
});


Ext.application({
    name : 'Fiddle',

    launch : function () {
        Ext.create('Ext.panel.Panel', {
            title    : 'Weekly timesheet',
            controller : 'timesheet',
            renderTo : Ext.getBody(),
            width    : 560,
            bodyPadding : 0,
            layout   : 'border',
            height   : 360,

            viewModel : {
                stores : {
                    entries : {
                        fields : ['day', 'project', { name : 'hours', type : 'number' }],
                        data   : [
                            { day : 'Mon', project : 'Onboarding', hours : 8 },
                            { day : 'Tue', project : 'Payroll run', hours : 7 },
                            { day : 'Wed', project : 'Support',     hours : 6 }
                        ]
                    }
                },

                formulas : {
                    // ----------------------------------------------------------
                    // TODO: make these recompute on every inline edit / add / remove.
                    // The plain-function form below is the NAIVE version and does
                    // NOT stay in sync when a `hours` cell is edited.
                    // ----------------------------------------------------------
                    totalHours : function (get) {
                        return get('entries').sum('hours');
                    },

                    saveDisabled : function (get) {
                        var store = get('entries'),
                            total = store.sum('hours');

                        return total === 0 || total > 40;   // (also: no invalid-row check yet)
                    }
                }
            },

            items : [
                {
                    xtype  : 'grid',
                    region : 'center',
                    reference : 'grid',
                    bind   : { store : '{entries}' },
                    selModel : 'rowmodel',
                    plugins : [{ ptype : 'cellediting', clicksToEdit : 1 }],
                    columns : [
                        { text : 'Day', dataIndex : 'day', width : 80,
                          editor : { xtype : 'textfield' } },
                        { text : 'Project', dataIndex : 'project', flex : 1,
                          editor : { xtype : 'textfield' } },
                        { text : 'Hours', dataIndex : 'hours', width : 90,
                          editor : { xtype : 'numberfield', minValue : 0, maxValue : 24 } }
                    ],
                    tbar : [
                        {
                            text : 'Add row',
                            handler : 'handleAddRow'
                        },
                        {
                            text : 'Remove selected',
                            handler : 'handleRemoveSelected'
                        }
                    ]
                },
                {
                    xtype  : 'toolbar',
                    region : 'south',
                    items  : [
                        { xtype : 'tbtext', bind : { html : '<b>Total: {totalHours} h</b>' } },
                        '->',
                        {
                            text : 'Save',
                            bind : { disabled : '{saveDisabled}' },
                            handler : 'handleSave'
                        }
                    ]
                }
            ]
        });
    }
});
```

================================================================================

# Task 4 — Async orchestration with Ext.Deferred

**Stack:** Ext JS **7.5.0**, **Classic** toolkit, Triton theme.
**Sandbox:** https://fiddle.sencha.com/#view/editor — select `Ext JS 7.5.0 classic triton`,
paste the whole block below, press **Run**.

https://fiddle.sencha.com/#view/editor&fiddle/3uva

## Context

An employee dashboard pulls in a few things when it opens. There's no real backend
here — you're given mock services, each returning an `Ext.Deferred` that resolves
after a short delay. `loadTimesheet` can be told to fail (there's a flag at the
top of the file), so you can try the error path too.

The shape of the data matters. The profile and the permissions are independent, so
they can load at the same time. The timesheet needs the `employeeId` off the
profile, so it can only go once the profile is back.

Your job is to write `loadDashboard()` on the controller. While it's loading, the
view should be masked. Load the profile and permissions together, then fetch the
timesheet for that employee, render a one-line summary on success (there's a
`renderDashboard(data)` helper ready for you), and surface a single error dialog if
anything fails. Whatever happens, the mask has to come off — and if the view is
already gone by the time the work finishes, it should quietly do nothing rather
than throw. Hand the promise back so a caller could chain onto it.

You'll know it's right when:

- the happy path masks, then shows `Jane Doe · 3 permissions · N timesheet
  entries`;
- setting `Api.failTimesheet = true` at the top and running again gives you an
  error dialog *and* the mask is gone, not stuck;
- `loadDashboard()` hands back a thenable you can `.then(...)` on.


## Starter code

The mock services are given; `loadDashboard()` is the part you write.

```javascript
// ====================== mock async services (given) ======================
var Api = {
    // flip to true to exercise the error path, then Run again
    failTimesheet : false,

    _delay : function (value, ms, fail) {
        var deferred = new Ext.Deferred();
        Ext.defer(function () {
            if (fail) {
                deferred.reject('Network error while loading timesheet');
            } else {
                deferred.resolve(value);
            }
        }, ms);
        return deferred.promise;
    },

    loadProfile : function () {
        return this._delay({ id : 1, name : 'Jane Doe', employeeId : 42 }, 400);
    },

    loadPermissions : function () {
        return this._delay(['view', 'edit', 'approve'], 300);
    },

    loadTimesheet : function (employeeId) {
        var entries = [
            { day : 'Mon', hours : 8 },
            { day : 'Tue', hours : 7 },
            { day : 'Wed', hours : 6 }
        ];
        // note: depends on employeeId from the profile
        return this._delay(entries, 500, this.failTimesheet);
    }
};


Ext.define('App.DashboardController', {
    extend : 'Ext.app.ViewController',
    alias  : 'controller.dashboard',

    onLoadClick : function () {
        this.loadDashboard();
    },

    // ---------------------------------------------------------------------
    // TODO: implement this.
    //  - parallel: profile + permissions
    //  - then dependent: timesheet for profile.employeeId
    //  - mask on start, ALWAYS unmask
    //  - single error handler
    //  - guard against destroyed view
    //  - return the promise
    // ---------------------------------------------------------------------
    loadDashboard : function () {
        // TODO
    },

    // Given: renders the result. Call this on success.
    renderDashboard : function (data) {
        this.lookup('output').setHtml(
            '<div style="padding:8px;font-size:14px">' +
                '<b>' + Ext.String.htmlEncode(data.profile.name) + '</b>' +
                ' · ' + data.permissions.length + ' permissions' +
                ' · ' + data.timesheet.length + ' timesheet entries' +
            '</div>'
        );
    }
});


Ext.application({
    name : 'Fiddle',

    launch : function () {
        Ext.create('Ext.panel.Panel', {
            title       : 'Employee dashboard',
            renderTo    : Ext.getBody(),
            width       : 480,
            bodyPadding : 12,
            controller  : 'dashboard',

            tbar : [
                { text : 'Load dashboard', handler : 'onLoadClick' }
            ],

            items : [
                {
                    xtype     : 'component',
                    reference : 'output',
                    html      : '<div style="padding:8px;color:#999">Press “Load dashboard”.</div>'
                }
            ]
        });
    }
});
```

================================================================================

# Task 5 — Large grid: filtering, bulk update & renderer hygiene

**Stack:** Ext JS **7.5.0**, **Classic** toolkit, Triton theme.
**Sandbox:** https://fiddle.sencha.com/#view/editor — select `Ext JS 7.5.0 classic triton`,
paste the whole block below, press **Run**.

https://fiddle.sencha.com/#view/editor&fiddle/3uvb

## Context

An employee directory with 10,000 rows, generated in memory. The grid already uses
buffered rendering, so only the on-screen rows are in the DOM. Three operations on
this screen are easy to write naively and will fall apart at this size — your job
is to make them hold up.

There are three `TODO`s in the scaffold.

**Live search.** Typing in the search box filters by `name` (case-insensitive
substring). At 10k rows it has to stay smooth, so don't re-filter on every
keystroke — debounce it, and keep a single filter rather than piling new ones on
top of each other.

**Bulk raise.** "Raise selected department by 10%" should bump the `salary` of
every matching employee, with the grid refreshing once rather than ten thousand
times. Batch the change properly, and go through the model's API rather than
poking the raw `data` object.

**Salary renderer.** Fill in `salaryRenderer` so it's pure, synchronous, returns a
string, and HTML-encodes what it outputs. Under buffered rendering it runs a lot,
so it should do nothing beyond formatting. If value > $50000 show as red.

Same ground rule as the others: fix those three spots — don't switch off buffered
rendering or rebuild the grid/store.

You'll know it's right when:

- search filters smoothly and doesn't fire on every character;
- picking a department and hitting "Raise 10%" updates all of its rows while the
  UI stays responsive — one refresh, no freeze;
- salaries show as `$72,000` and any text is HTML-encoded.


## Starter code

Paste this in and Run; the three `TODO`s in the controller are what you fill in.

```javascript
Ext.define('App.DirectoryController', {
    extend : 'Ext.app.ViewController',
    alias  : 'controller.directory',

    // TODO #1: single, replaceable filter by name (case-insensitive substring).
    // The listener is also where you debounce — see the search field below.
    handleSearchChange : function (field, value) {
        var store = this.getView().getStore();
        // TODO
    },

    // TODO #2: raise salary by 10% for ALL records of the chosen dept,
    // batched so the view refreshes ONCE. Use record.set(...).
    handleRaise : function () {
        var store = this.getView().getStore(),
            dept  = this.lookup('deptCombo').getValue();
        // TODO
    },

    // TODO #3: pure, synchronous, HTML-encoding salary renderer.
    // Runs MANY times under buffered rendering — formatting only.
    salaryRenderer : function (value) {
        // TODO
        return value;
    }
});


Ext.application({
    name : 'Fiddle',

    launch : function () {
        var departments = ['HR', 'Payroll', 'Engineering', 'Sales', 'Support'],
            data = [],
            i;

        for (i = 1; i <= 10000; i++) {
            data.push({
                id         : i,
                name       : 'Employee ' + i,
                department : departments[i % departments.length],
                salary     : 40000 + (i % 50) * 1000
            });
        }

        Ext.create('Ext.grid.Panel', {
            title      : 'Employee directory (' + data.length + ' rows)',
            renderTo   : Ext.getBody(),
            height     : 460,
            width      : 720,
            controller : 'directory',

            store : {
                fields : ['id', 'name', 'department', { name : 'salary', type : 'number' }],
                data   : data
            },

            tbar : [
                'Search:',
                {
                    xtype     : 'textfield',
                    emptyText : 'name contains…',
                    width     : 220,
                    // TODO #1: debounce this — e.g. { fn : 'handleSearchChange', buffer : 300 }
                    listeners : {
                        change : 'handleSearchChange'
                    }
                },
                '->',
                'Dept:',
                {
                    xtype     : 'combobox',
                    reference : 'deptCombo',
                    width     : 140,
                    editable  : false,
                    queryMode : 'local',
                    value     : 'Engineering',
                    store     : departments
                },
                {
                    text    : 'Raise 10%',
                    handler : 'handleRaise'
                }
            ],

            columns : [
                { text : 'ID', dataIndex : 'id', width : 70 },
                { text : 'Name', dataIndex : 'name', flex : 1 },
                { text : 'Department', dataIndex : 'department', width : 130 },
                { text : 'Salary', dataIndex : 'salary', width : 130, renderer : 'salaryRenderer' }
            ]
        });
    }
});
```

================================================================================
