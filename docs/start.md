# Starting Points

## Build Configurations

There are three functionally different LOWA build configurations:

- A plain build, using Qt-based interaction with a graphical canvas.  Starting points for integration are `qt_soffice.html` or `soffice.js`.

- A build configured with `--disable-gui`, which provides a headless LOWA server that does not use any graphical canvas.  The starting point for integration is `soffice.js`.

- A build configured with `--enable-emscripten-proxy-posix-sockets`.  This is similar to the plain build, but supports network access via a proxy server.  For now, it requires a modified emsdk.  See [Network Document Access: Access Via a Proxy Server](network.html#access-via-a-proxy-server) for details.

In each of those build configurations, `soffice.js` expects to find the global [Emscripten `Module` variable](https://emscripten.org/docs/api_reference/module.html) to be bound to an object providing certain properties:

- For all builds, `Module.uno_scripts` must be an array of strings representing (relative or absolute) URLs of JavaScript scripts to load into the LOWA context, in order.  If any of those scripts makes use of zetajs, then `zeta.js` must come first in that array.  (These scripts will not run in the browser's main thread, but in a worker thread that runs the LOWA code.)

- For the plain and `--enable-emscripten-proxy-posix-sockets` builds, `Module.canvas` must reference the HTML `canvas` element that LOWA shall interact with.  The ID of that element must be `qtcanvas`.

- For the `--enable-emscripten-proxy-posix-sockets` build, `Module.uno_websocket_to_posix_socket_url` must be a string specifying an absolute `ws` or `wss` URL at which the proxy server can be reached.

## Using zetajs

To use zetajs, JS code must:

- List the `zeta.js` URL as a first element of the `Module.uno_scripts` array (see above).

- Wait for the `Module.zetajs` [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) to resolve, which will yield a `zetajs` object.

That `zetajs` object has certain properties:

- `zetajs.type` is a JavaScript object used to represent values of UNO type `TYPE`:

    - `zetajs.type.void` is a zetajs representation of the UNO `TYPE` value denoting the UNO type `VOID`.

    - `zetajs.type.boolean` is a zetajs representation of the UNO `TYPE` value denoting the UNO type `BOOLEAN`.

    - `zetajs.type.byte` is a zetajs representation of the UNO `TYPE` value denoting the UNO type `BYTE`.

    - `zetajs.type.short` is a zetajs representation of the UNO `TYPE` value denoting the UNO type `SHORT`.

    - `zetajs.type.unsigned_short` is a zetajs representation of the UNO `TYPE` value denoting the UNO type `UNSIGNED SHORT`.

    - `zetajs.type.long` is a zetajs representation of the UNO `TYPE` value denoting the UNO type `LONG`.

    - `zetajs.type.unsigned_long` is a zetajs representation of the UNO `TYPE` value denoting the UNO type `UNSIGNED LONG`.

    - `zetajs.type.hyper` is a zetajs representation of the UNO `TYPE` value denoting the UNO type `HYPER`.

    - `zetajs.type.unsigned_hyper` is a zetajs representation of the UNO `TYPE` value denoting the UNO type `UNSIGNED HYPER`.

    - `zetajs.type.float` is a zetajs representation of the UNO `TYPE` value denoting the UNO type `FLOAT`.

    - `zetajs.type.double` is a zetajs representation of the UNO `TYPE` value denoting the UNO type `DOUBLE`.

    - `zetajs.type.char` is a zetajs representation of the UNO `TYPE` value denoting the UNO type `CHAR`.

    - `zetajs.type.string` is a zetajs representation of the UNO `TYPE` value denoting the UNO type `STRING`.

    - `zetajs.type.type` is a zetajs representation of the UNO `TYPE` value denoting the UNO type `TYPE`.

    - `zetajs.type.any` is a zetajs representation of the UNO `TYPE` value denoting the UNO type `ANY`.

    - `zetajs.type.sequence` is a function that takes as a single argument a zetajs representation of a value of UNO type `TYPE`, and returns a zetajs representation of the UNO `TYPE` value denoting the UNO sequence type with the given component type.

    - `zetajs.type.enum` is a function that takes as a single argument an opaque value representing a UNO enum type, obtained through the `zetajs.uno` dictionary, and returns a zetajs representation of the UNO `TYPE` value denoting the given UNO enum type.

    - `zetajs.type.struct` is a function that takes as a single argument an opaque value representing a UNO struct type, obtained through the `zetajs.uno` dictionary, and returns a zetajs representation of the UNO `TYPE` value denoting the given UNO struct type.

    - `zetajs.type.exception` is a function that takes as a single argument an opaque value representing a UNO exception type, obtained through the `zetajs.uno` dictionary, and returns a zetajs representation of the UNO `TYPE` value denoting the given UNO exception type.

    - `zetajs.type.interface` is a function that takes as a single argument an opaque value representing a UNO interface type, obtained through the `zetajs.uno` dictionary, and returns a zetajs representation of the UNO `TYPE` value denoting the given UNO interface type.

    Each of those zetajs representations is an opaque object that supports [`toString`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString) to obtain the [name of the denoted UNO type](http://www.openoffice.org/udk/common/man/typesystem.html).

- `zetajs.Any` is a constructor function for representations of values of UNO type `ANY`.  It takes two arguments, the first being a zetajs representation of a value of UNO type `TYPE`, and the second being a zetajs representation of a value of the given UNO type.

- `zetajs.getAnyType` is a function that maps a zetajs representation of a value of UNO type `ANY` to a zetajs representation of the type of the contained UNO value.

- `zetajs.fromAny` is a function that maps a zetajs representation of a value of UNO type `ANY` to a zetajs representation of its contained UNO value.

- `zetajs.sameUnoObject` is a function that checks whether two zetajs representations of values of arbitrary UNO interface types reference the same UNO object (or are both null references).  It returns a value of JavaScript Boolean type.

- `zetajs.getUnoComponentContext` is the starting point that returns a zetajs representation referencing the [global UNO component context](https://wiki.documentfoundation.org/Documentation/DevGuide/Professional_UNO#Component_Context).

- `zetajs.throwUnoException` is a function that takes a zetajs representation of a value of a UNO exception type and throws that UNO exception.  (UNO exceptions cannot be thrown directly from a JavaScript `throw` expression.  You always need to use `zetajs.throwUnoException` to throw UNO exceptions.)

- `zetajs.catchUnoException` is a function that is typically used in a JavaScript `catch` block.  It takes an arbitrary JavaScript value (i.e.., the `e` in a JavaScript `catch (e)` block).  If the given value is not a zetajs representation of a value of a UNO exception type, it is re-thrown.  Otherwise, a zetajs representation of a UNO value of type `ANY` containing the given UNO exception is returned.  (The given `e` in a JavaScript `catch (e)` block would not directly denote the zetajs representation of the given UNO exception.  You always need to use `zetajs.catchUnoException` to catch UNO exceptions.)

- `zetajs.uno` is a hierarchical dictionary of known UNOIDL entities (where `zetajs.uno` itself is a JavaScript object representing the global UNOIDL namespace):

    - A UNO enum type is represented by a JavaScript object whose properties are zetajs representations of the enum type's members.

    - A UNO struct type is represented by a constructor function that constructs new instances of the given struct type.  For a plain struct type, the function takes a single argument, a JavaScript object whose properties are used to initialize the members of the UNO struct value.  (Any member for which the given JavaScript object has no corresponding property is initialized to its default value.)  For a polymorphic struct type template, the function takes as an additional first argument an array of UNO type arguments (given as zetajs representations of value of UNO type `TYPE`) to instantiate the template with.  In both cases, the function returns a zetajs representation of the newly created UNO struct value.

    - A UNO exception type is represented by a constructor function that constructs new instances of the given exception type.  The function takes a single argument, a JavaScript object whose properties are used to initialize the members of the UNO exception value.  (Any member for which the given JavaScript object has no corresponding property is initialized to its default value.)  The function returns a zetajs representation of the newly created UNO exception value.

    - A UNOIDL namespace is represented by a JavaScript object whose properties recursively represent members of the namespace.

    - A UNOIDL interface-based singleton is represented by a function that takes as a single argument a zetajs representation of a value of UNO interface type [`com.sun.star.uno.XComponentContext`](https://api.libreoffice.org/docs/idl/ref/interfacecom_1_1sun_1_1star_1_1uno_1_1XComponentContext.html) and returns a zetajs representation referencing that singleton.

    - A UNOIDL single-interface-based service is represented by a JavaScript object whose properties are functions corresponding to the service's constructors.  Each of those functions takes as an additional first argument a zetajs representation of a value of UNO interface type [`com.sun.star.uno.XComponentContext`](https://api.libreoffice.org/docs/idl/ref/interfacecom_1_1sun_1_1star_1_1uno_1_1XComponentContext.html).

    - A UNOIDL constant group is represented by a JavaScript object whose properties are zetajs representations of the constant group's members.

    - In addition to the above, UNO enum, struct, exception, and interface types are represented by opaque JavaScript values that are used by the `zetajs.type` machinery.

- `zetajs.unoObject` is a function that creates UNO objects implemented in JavaScript.  It takes two arguments, an array of UNO interface types implemented by the UNO object (given as zetajs representations of values of UNO type `TYPE`), and a JavaScript object whose properties are implementations of the UNO interface methods and attribute getters and setters.  The UNO interface types [`com.sun.star.uno.XInterface`](https://api.libreoffice.org/docs/idl/ref/interfacecom_1_1sun_1_1star_1_1uno_1_1XInterface.html) and [`com.sun.star.lang.XTypeProvider`](https://api.libreoffice.org/docs/idl/ref/interfacecom_1_1sun_1_1star_1_1lang_1_1XTypeProvider.html) are automatically supported by the returned UNO object, they shall not be listed in the given array of UNO interface types and their methods shall not be provided by the given JavaScript object.  The function returns a zetajs representation referencing the newly created UNO object.

- `zetajs.mainPort` is used for [communication between threads](#communication-between-threads).

See [The zetajs UNO Mapping](uno.html) for further documentation of the mapping between zetajs and UNO.  Whenver a value of UNO type `ANY` is returned from zetajs, the unwrapped repsresentation will be used.  However, for situations that need to preserve the exact contained type of a returned value of UNO type `ANY`, each zetajs representation of a UNO object has a `$precise` property.  For UNO calls made through such a `$precise` property, whenever a value of UNO type `ANY` is returned, the wrapped repsresentation will be used.

## Communication Between Threads

As JS code using zetajs is not run on the browser's main thread, it cannot directly access the browser's `document`.  Instead, a [`MessageChannel`](https://developer.mozilla.org/en-US/docs/Web/API/MessageChannel) is available that can be used for communication between the browser's main thread and the worker thread running the JS code using zetajs.  (The communication protocol to use is entirely up to the application.)

In the browser's main thread, `Module.uno_main` is a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that resolves to one of the two ports of the channel.

In the JS code using zetajs, the other port of the channel is available as `zetajs.mainPort`.
