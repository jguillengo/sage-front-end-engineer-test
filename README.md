# Sage Front-End Engineer Technical Assessment

## Task 1 — Widget state recycling in a buffered grid

### Problem

The original implementation stores a row specific state outside the widget's current record association.

Because widgets are recycled by the buffered grid, the deferred callback can run after a widget has already been attached to a different record. In addition, `col._lastRecord` is shared by the whole column, so the button handler can act on the wrong row.

### Solution

The widget state is now updated synchronously in `onWidgetAttach`, using the record currently attached to the widget.

The button handler retrieves its current record through `getWidgetRecord()` and updates that record through the model API.

Both the button text and disabled state are reassigned whenever the widget is attached to a record, preventing state from leaking between recycled rows.

### References

- [Ext.grid.column.Widget — Ext JS 7.5.0 Classic](https://docs.sencha.com/extjs/7.5.0/classic/Ext.grid.column.Widget.html)
  - `onWidgetAttach`
  - `getWidgetRecord()`

- [Ext.button.Button — Ext JS 7.5.0 Classic](https://docs.sencha.com/extjs/7.5.0/classic/Ext.button.Button.html)
  - `setText()`
  - `setDisabled()`

- [Ext.data.Model — Ext JS 7.5.0 Classic](https://docs.sencha.com/extjs/7.5.0/classic/Ext.data.Model.html)
  - `get()`
  - `set()`

  ## Task 2 — A custom two-way bindable component

### Problem

The custom `starrating` component needs to behave like a bindable field while remaining a plain `Ext.Component`.

Its value must stay synchronized with the ViewModel in both directions, remain within the valid rating range and update its UI safely regardless of whether the value changes before or after rendering.

### Solution

`value` and `maxStars` are implemented through the Ext JS config system.

`value` is set as the component's `defaultBindProperty` and marked as `twoWayBindable`, allowing `bind: '{rating}'` to synchronize changes both from the ViewModel to the component and from the component back to the ViewModel.

`applyValue` normalizes and clamps incoming values before they are stored. `updateValue` refreshes the stars only when the component has already rendered, while `afterRender` performs the initial render.

Star clicks are handled through a delegated listener on the component's root element. Clicking a star calls `setValue()`, allowing the config and binding systems to propagate the new value without additional form-level wiring.

### References

- [Ext.mixin.Bindable — Ext JS 7.5.0 Classic](https://docs.sencha.com/extjs/7.5.0/classic/Ext.mixin.Bindable.html)
  - `defaultBindProperty`
  - `twoWayBindable`

- [Ext.Class — `config` — Ext JS 7.5.0 Classic](https://docs.sencha.com/extjs/7.5.0/classic/Ext.Class.html#cfg-config)
  - generated `getFoo()` / `setFoo()` methods
  - `applyFoo()`
  - `updateFoo()`

- [Ext.Component — Ext JS 7.5.0 Classic](https://docs.sencha.com/extjs/7.5.0/classic/Ext.Component.html)
  - `rendered`
  - `afterRender`
  - `getEl()`
  - `setHtml()`

- [Ext.Base — Ext JS 7.5.0 Classic](https://docs.sencha.com/extjs/7.5.0/classic/Ext.Base.html)
  - `callParent()`

- [Ext.dom.Element — Ext JS 7.5.0 Classic](https://docs.sencha.com/extjs/7.5.0/classic/Ext.dom.Element.html)
  - `on()`
    - `delegate`
  - `click`

## Task 3 — Reactive timesheet totals & validation

### Problem

The original `totalHours` formula only depends on the `entries` store reference. Editing a field inside one of its records does not replace that store instance, so the formula does not reliably react to record changes.

Both the running total and the validation state need to react to edits, additions and removals while remaining inside the ViewModel.

### Solution

`totalHours` uses an explicit deep binding to the `entries` store. This allows the formula to react to changes inside its records and recalculate the total through `Store.sum()`.

A separate `hasInvalidHours` formula uses the same deep-binding pattern and `Store.findBy()` to detect the first row whose `hours` value falls outside the valid `0–24` range.

`saveDisabled` then depends on the two derived formulas instead of inspecting the store directly. This keeps the final business rule declarative and avoids recalculating `totalHours`.

### Design choice

The total and row validation are kept as two small deep-bound formulas. They could be combined into a single aggregate formula that calculates both values in one pass, but that would introduce an additional intermediate structure for a very small timesheet store.

Keeping them separate follows the documented advanced store-binding pattern, avoids duplicating the total calculation, and keeps each formula focused on one responsibility.

### References

- [Ext.app.ViewModel — Ext JS 7.5.0 Classic](https://docs.sencha.com/extjs/7.5.0/classic/Ext.app.ViewModel.html)
  - Binding
    - Bind Options
      - Deep Binding
      - Binding Timings
  - Stores
    - Advanced Store Binding

- [Ext.app.bind.Formula — Ext JS 7.5.0 Classic](https://docs.sencha.com/extjs/7.5.0/classic/Ext.app.bind.Formula.html)
  - Formula Basics
    - Data Dependencies
    - The Getter Method
  - Explicit Binding

- [Ext.data.Store — Ext JS 7.5.0 Classic](https://docs.sencha.com/extjs/7.5.0/classic/Ext.data.Store.html)
  - `sum()`
  - `findBy()`

- [Ext.data.Model — Ext JS 7.5.0 Classic](https://docs.sencha.com/extjs/7.5.0/classic/Ext.data.Model.html)
  - `get()`

