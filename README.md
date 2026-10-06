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