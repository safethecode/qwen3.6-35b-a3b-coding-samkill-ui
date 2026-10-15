# Five bounded value corrections

Fix before expanding dependent UI. Direct390px screenshot shows a photo's positive-z-index favorite painting over the fixed bottom navigation. Set the existing shared .bottom-navigation z-index:10,which is above cardfavorite1. This is the chosen fixedchrome layer;dialogs remain in native top layer. Do not hide or move cardfavorite.

At normal390px the sortlabel andselect should share a readable row. Give the existing owned search .sort-control flex:1 1 calc(9em + 60px),so its outer results-tools parent allocates the remainingwidth. Existing wrapping and fieldpreferredbasis preserve reading width at enlargednarrow sizes. Keep all padding/type/labels unchanged.

The prior nativefields contract required quietsurface on secondary dialogcancel,but Qwen returned transparent. Correct dialogbutton[type=button] background:var(--quiet). Both that cancel and .field-control select should reuse existing darktexttoken var(--text),rather than hardcode its equalhex. Do not touch primarysubmit orfocus. Only these exactfivepropertyvalues are writable;all otherproperties andsource unchanged.
