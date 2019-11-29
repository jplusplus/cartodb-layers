## Classes

<dl>
<dt><a href="#Rest">Rest</a></dt>
<dd><p>Class to communicate with CARTO Rest API</p>
</dd>
<dt><a href="#Turbocarto">Turbocarto</a></dt>
<dd><p>Class to manipulate TurboCarto strings.</p>
</dd>
</dl>

<a name="Rest"></a>

## Rest
Class to communicate with CARTO Rest API

**Kind**: global class  

* [Rest](#Rest)
    * [new Rest(args)](#new_Rest_new)
    * [.get(args)](#Rest+get) ⇒ <code>Promise</code>
    * [.post(args)](#Rest+post) ⇒ <code>Promise</code>
    * [.delete(args)](#Rest+delete) ⇒ <code>Promise</code>
    * ~~[.del(args)](#Rest+del) ⇒ <code>Promise</code>~~

<a name="new_Rest_new"></a>

### new Rest(args)
Create a Rest instance


| Param | Type | Description |
| --- | --- | --- |
| args | <code>Object</code> | An object to configure the client with a "user" and "api_key" properties. |

<a name="Rest+get"></a>

### rest.get(args) ⇒ <code>Promise</code>
Perform a GET request over CARTO API.

**Kind**: instance method of [<code>Rest</code>](#Rest)  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>Object</code> | Spread parameters to `axios` method |

<a name="Rest+post"></a>

### rest.post(args) ⇒ <code>Promise</code>
Perform a POST request over CARTO API.

**Kind**: instance method of [<code>Rest</code>](#Rest)  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>Object</code> | Spread parameters to `axios` method |

<a name="Rest+delete"></a>

### rest.delete(args) ⇒ <code>Promise</code>
Perform a DELETE request over CARTO API.

**Kind**: instance method of [<code>Rest</code>](#Rest)  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>Object</code> | Spread parameters to `axios` method |

<a name="Rest+del"></a>

### ~~rest.del(args) ⇒ <code>Promise</code>~~
***Deprecated***

Perform a DELETE request over CARTO API.

**Kind**: instance method of [<code>Rest</code>](#Rest)  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>Object</code> | Spread parameters to `axios` method |

<a name="Turbocarto"></a>

## Turbocarto
Class to manipulate TurboCarto strings.

**Kind**: global class  

* [Turbocarto](#Turbocarto)
    * [new Turbocarto(rest)](#new_Turbocarto_new)
    * [.turbocartoToCartocss(turbocarto, sql)](#Turbocarto+turbocartoToCartocss) ⇒ <code>Promise</code>

<a name="new_Turbocarto_new"></a>

### new Turbocarto(rest)
Create a Turbocarto instance


| Param | Type | Description |
| --- | --- | --- |
| rest | [<code>Rest</code>](#Rest) | An instance of Rest |

<a name="Turbocarto+turbocartoToCartocss"></a>

### turbocarto.turbocartoToCartocss(turbocarto, sql) ⇒ <code>Promise</code>
Populate the TurboCarto strings with data from an SQL query in order to generate CartoCSS.

**Kind**: instance method of [<code>Turbocarto</code>](#Turbocarto)  

| Param | Type | Description |
| --- | --- | --- |
| turbocarto | <code>string</code> | TurboCarto string. |
| sql | <code>string</code> | SQL query to read data. |

