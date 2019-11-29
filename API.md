## Classes

<dl>
<dt><a href="#CartodbLayers">CartodbLayers</a></dt>
<dd><p>Main class to expose all the module of this library</p>
</dd>
<dt><a href="#Memoizable">Memoizable</a></dt>
<dd><p>Abstract Class to implement memoized methods</p>
</dd>
<dt><a href="#Rest">Rest</a></dt>
<dd><p>Class to communicate with CARTO Rest API</p>
</dd>
<dt><a href="#Turbocarto">Turbocarto</a></dt>
<dd><p>Class to manipulate TurboCARTO strings.</p>
</dd>
</dl>

<a name="CartodbLayers"></a>

## CartodbLayers
Main class to expose all the module of this library

**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| client | <code>CartoDB.SQL</code> | CartoDB SQL client |
| rest | [<code>Rest</code>](#Rest) | Rest client |
| turbocarto | [<code>Turbocarto</code>](#Turbocarto) | TruboCARTO client |

<a name="new_CartodbLayers_new"></a>

### new CartodbLayers()

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [args.user] | <code>String</code> | <code>cartodb</code> | CARTO username |
| args.api_key | <code>String</code> |  | CARTO api key |

<a name="Memoizable"></a>

## *Memoizable*
Abstract Class to implement memoized methods

**Kind**: global abstract class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| methods | <code>Object</code> | All the methods of the class |
| memoized | <code>Object</code> | All the methods of the class, but memoized (no expiration) |


* *[Memoizable](#Memoizable)*
    * *[new Memoizable()](#new_Memoizable_new)*
    * *[.throttled([wait])](#Memoizable+throttled) ⇒ <code>Object</code>*

<a name="new_Memoizable_new"></a>

### *new Memoizable()*
This abstract class should not call this constructor method or an error
will be thrown.

**Throws**:

- <code>Error</code> Thrown when the class is called directly.

<a name="Memoizable+throttled"></a>

### *memoizable.throttled([wait]) ⇒ <code>Object</code>*
Returns the methods of the class, wrapped inside a throttled function

**Kind**: instance method of [<code>Memoizable</code>](#Memoizable)  
**Returns**: <code>Object</code> - All the methods of the class  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [wait] | <code>Number</code> | <code></code> | Throttle duration in millisecond. The `null` means no limitations. |

<a name="Rest"></a>

## Rest
Class to communicate with CARTO Rest API

**Kind**: global class  

* [Rest](#Rest)
    * [new Rest(args)](#new_Rest_new)
    * _instance_
        * [.get(args)](#Rest+get) ⇒ <code>Promise</code>
        * [.post(args)](#Rest+post) ⇒ <code>Promise</code>
        * [.delete(args)](#Rest+delete) ⇒ <code>Promise</code>
        * ~~[.del(args)](#Rest+del) ⇒ <code>Promise</code>~~
        * [.findInfowindow(viz)](#Rest+findInfowindow) ⇒ <code>Object</code>
        * [.buildParams([page], [per_page])](#Rest+buildParams) ⇒ <code>Object</code>
        * ~~[.buildQuery(page, per_page)](#Rest+buildQuery) ⇒ <code>Object</code>~~
        * ~~[.layers()](#Rest+layers) ⇒ <code>Array</code>~~
        * [.getLayers()](#Rest+getLayers) ⇒ <code>Array</code>
        * [.tables()](#Rest+tables) ⇒ <code>Array</code>
        * [.emitterAsPromise(emitter)](#Rest+emitterAsPromise) ⇒ <code>Promise</code>
        * [.createNamedMap(template)](#Rest+createNamedMap) ⇒ <code>Promise</code>
        * [.deleteNamedMap(template_id)](#Rest+deleteNamedMap) ⇒ <code>Promise</code>
        * [.deleteNamedMapIfExist(template_id)](#Rest+deleteNamedMapIfExist) ⇒ <code>Promise</code>
        * ~~[.instanciate(template_id, params)](#Rest+instanciate) ⇒ <code>Promise</code>~~
        * [.instantiateNamedMap(template_id, params)](#Rest+instantiateNamedMap) ⇒ <code>Promise</code>
        * ~~[.viz(id, [resolveNamedMap])](#Rest+viz) ⇒ <code>Promise</code>~~
        * [.getVizV2(id, [resolveNamedMap])](#Rest+getVizV2) ⇒ <code>Promise</code>
        * [.getVizV1(id)](#Rest+getVizV1) ⇒ <code>Promise</code>
        * [.named(name)](#Rest+named) ⇒ <code>Promise</code>
        * [.getNamedMap(name)](#Rest+getNamedMap) ⇒ <code>Promise</code>
        * [.getNamedMaps()](#Rest+getNamedMaps) ⇒ <code>Promise</code>
        * [.importedAt()](#Rest+importedAt) ⇒ <code>String</code>
        * [.uniqueNamedMapId(id)](#Rest+uniqueNamedMapId) ⇒ <code>String</code>
        * [.projection(id, name, cartocss, sql, interactivity)](#Rest+projection) ⇒ <code>Promise</code>
        * [.vizNewNamedMap(id, name, cartocss, sql, interactivity)](#Rest+vizNewNamedMap) ⇒ <code>Promise</code>
        * [.basemapLayer()](#Rest+basemapLayer) ⇒ <code>Object</code>
        * [.static(id, noBasemap)](#Rest+static) ⇒ <code>Object</code>
        * [.search(q, [type], page, per_page)](#Rest+search)
        * [.image(specs, [width], [height], [protocol], [format], [useCenter])](#Rest+image) ⇒ <code>String</code>
        * [.data(id)](#Rest+data) ⇒ <code>Promise</code>
        * [.vizSqlQuery(id)](#Rest+vizSqlQuery) ⇒ <code>Promise</code>
        * [.vizRelatedTables(id)](#Rest+vizRelatedTables) ⇒ <code>Promise</code>
        * [.vizTable(id)](#Rest+vizTable) ⇒ <code>String</code>
        * [.fillParams(sql)](#Rest+fillParams) ⇒ <code>String</code>
        * [.fields(id)](#Rest+fields) ⇒ <code>Array</code>
    * _static_
        * [.firstNonNul(tasks)](#Rest.firstNonNul) ⇒ <code>Mixed</code>
        * [.queryCollection(data, path, force)](#Rest.queryCollection) ⇒ <code>Mixed</code>
        * [.sqlQueryToTable(sql)](#Rest.sqlQueryToTable) ⇒ <code>String</code>

<a name="new_Rest_new"></a>

### new Rest(args)
Create a Rest instance


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| args | <code>Object</code> |  | An object to configure the client with a "user" and "api_key" properties. |
| [args.user] | <code>String</code> | <code>cartodb</code> | CARTO username |
| args.api_key | <code>String</code> |  | CARTO api key |

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

<a name="Rest+findInfowindow"></a>

### rest.findInfowindow(viz) ⇒ <code>Object</code>
Find an infowindow description object in the given vizualisation

**Kind**: instance method of [<code>Rest</code>](#Rest)  

| Param | Type | Description |
| --- | --- | --- |
| viz | <code>Object</code> | Vizualisation description object from CARTO API |

<a name="Rest+buildParams"></a>

### rest.buildParams([page], [per_page]) ⇒ <code>Object</code>
Build query parameters to paginate results from CARTO

**Kind**: instance method of [<code>Rest</code>](#Rest)  

| Param | Type | Default |
| --- | --- | --- |
| [page] | <code>Number</code> | <code>1</code> | 
| [per_page] | <code>Number</code> | <code>10</code> | 

<a name="Rest+buildQuery"></a>

### ~~rest.buildQuery(page, per_page) ⇒ <code>Object</code>~~
***Deprecated***

Build query parameters to paginate results from CARTO

**Kind**: instance method of [<code>Rest</code>](#Rest)  

| Param | Type |
| --- | --- |
| page | <code>Number</code> | 
| per_page | <code>Number</code> | 

<a name="Rest+layers"></a>

### ~~rest.layers() ⇒ <code>Array</code>~~
***Deprecated***

Get all "layers" which is basicaly all user's vizualisations

**Kind**: instance method of [<code>Rest</code>](#Rest)  
<a name="Rest+getLayers"></a>

### rest.getLayers() ⇒ <code>Array</code>
Get all "layers" which is basicaly all user's vizualisations

**Kind**: instance method of [<code>Rest</code>](#Rest)  
<a name="Rest+tables"></a>

### rest.tables() ⇒ <code>Array</code>
Get all user's tables

**Kind**: instance method of [<code>Rest</code>](#Rest)  
<a name="Rest+emitterAsPromise"></a>

### rest.emitterAsPromise(emitter) ⇒ <code>Promise</code>
Cast the given event emmiter to a Promise

**Kind**: instance method of [<code>Rest</code>](#Rest)  

| Param | Type |
| --- | --- |
| emitter | <code>Object</code> | 

<a name="Rest+createNamedMap"></a>

### rest.createNamedMap(template) ⇒ <code>Promise</code>
Create a named map based on the given template object

**Kind**: instance method of [<code>Rest</code>](#Rest)  

| Param | Type |
| --- | --- |
| template | <code>Object</code> | 

<a name="Rest+deleteNamedMap"></a>

### rest.deleteNamedMap(template_id) ⇒ <code>Promise</code>
Delete a named map

**Kind**: instance method of [<code>Rest</code>](#Rest)  

| Param | Type | Description |
| --- | --- | --- |
| template_id | <code>String</code> | Id of the template to delete |

<a name="Rest+deleteNamedMapIfExist"></a>

### rest.deleteNamedMapIfExist(template_id) ⇒ <code>Promise</code>
Delete a named map but return null without throwing an error if the named
map doesn't exist

**Kind**: instance method of [<code>Rest</code>](#Rest)  

| Param | Type | Description |
| --- | --- | --- |
| template_id | <code>String</code> | Id of the template to delete |

<a name="Rest+instanciate"></a>

### ~~rest.instanciate(template_id, params) ⇒ <code>Promise</code>~~
***Deprecated***

Create an instance of the given name map with custom params

**Kind**: instance method of [<code>Rest</code>](#Rest)  

| Param | Type | Description |
| --- | --- | --- |
| template_id | <code>String</code> | Id of the template |
| params | <code>Object</code> | Params of the named map |

<a name="Rest+instantiateNamedMap"></a>

### rest.instantiateNamedMap(template_id, params) ⇒ <code>Promise</code>
Create an instance of the given name map with custom params

**Kind**: instance method of [<code>Rest</code>](#Rest)  

| Param | Type | Description |
| --- | --- | --- |
| template_id | <code>String</code> | Id of the template |
| params | <code>Object</code> | Params of the named map |

<a name="Rest+viz"></a>

### ~~rest.viz(id, [resolveNamedMap]) ⇒ <code>Promise</code>~~
***Deprecated***

Get a vizualisation using CARTO API v2

**Kind**: instance method of [<code>Rest</code>](#Rest)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| id | <code>String</code> |  | Id of the vizualisation |
| [resolveNamedMap] | <code>Boolean</code> | <code>true</code> | Should add the vizualisation's named map |

<a name="Rest+getVizV2"></a>

### rest.getVizV2(id, [resolveNamedMap]) ⇒ <code>Promise</code>
Get a vizualisation using CARTO API v2

**Kind**: instance method of [<code>Rest</code>](#Rest)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| id | <code>String</code> |  | Id of the vizualisation |
| [resolveNamedMap] | <code>Boolean</code> | <code>true</code> | Should add the vizualisation's named map |

<a name="Rest+getVizV1"></a>

### rest.getVizV1(id) ⇒ <code>Promise</code>
Get a vizualisation using CARTO API v1

**Kind**: instance method of [<code>Rest</code>](#Rest)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | Id of the vizualisation |

<a name="Rest+named"></a>

### rest.named(name) ⇒ <code>Promise</code>
Get a named map using CARTO API v1

**Kind**: instance method of [<code>Rest</code>](#Rest)  
**Depracted**:   

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | Name of the Named Map |

<a name="Rest+getNamedMap"></a>

### rest.getNamedMap(name) ⇒ <code>Promise</code>
Get a named map using CARTO API v1

**Kind**: instance method of [<code>Rest</code>](#Rest)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | Name of the Named Map |

<a name="Rest+getNamedMaps"></a>

### rest.getNamedMaps() ⇒ <code>Promise</code>
Get all named maps using CARTO API v1

**Kind**: instance method of [<code>Rest</code>](#Rest)  
<a name="Rest+importedAt"></a>

### rest.importedAt() ⇒ <code>String</code>
Get the current date as a locale string in UTC timezone

**Kind**: instance method of [<code>Rest</code>](#Rest)  
<a name="Rest+uniqueNamedMapId"></a>

### rest.uniqueNamedMapId(id) ⇒ <code>String</code>
Get a unique named map id based on the date

**Kind**: instance method of [<code>Rest</code>](#Rest)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | Named Map name (or id) |

<a name="Rest+projection"></a>

### rest.projection(id, name, cartocss, sql, interactivity) ⇒ <code>Promise</code>
Instanciate a new Named Map with a custom CartoCSS and SQL projection

**Kind**: instance method of [<code>Rest</code>](#Rest)  
**Depracted**:   

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | Named Map name (or id) |
| name | <code>String</code> | Name of the new named map |
| cartocss | <code>String</code> | Custom CartoCSS |
| sql | <code>String</code> | Custom SQL |
| interactivity | <code>String</code> | A commat separated list of fields the user can interact with |

<a name="Rest+vizNewNamedMap"></a>

### rest.vizNewNamedMap(id, name, cartocss, sql, interactivity) ⇒ <code>Promise</code>
Instanciate a new Named Map with a custom CartoCSS and SQL projection

**Kind**: instance method of [<code>Rest</code>](#Rest)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | Named Map name (or id) |
| name | <code>String</code> | Name of the new named map |
| cartocss | <code>String</code> | Custom CartoCSS |
| sql | <code>String</code> | Custom SQL |
| interactivity | <code>String</code> | A commat separated list of fields the user can interact with |

<a name="Rest+basemapLayer"></a>

### rest.basemapLayer() ⇒ <code>Object</code>
Get the default basemap layer definition

**Kind**: instance method of [<code>Rest</code>](#Rest)  
<a name="Rest+static"></a>

### rest.static(id, noBasemap) ⇒ <code>Object</code>
Get the static definition (image) of a given vizualisation

**Kind**: instance method of [<code>Rest</code>](#Rest)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | Vizualisation id |
| noBasemap | <code>Boolean</code> | Disabled the basemap layer in the static visualization |

<a name="Rest+search"></a>

### rest.search(q, [type], page, per_page)
Search a visualization by its name

**Kind**: instance method of [<code>Rest</code>](#Rest)  

| Param | Default | Description |
| --- | --- | --- |
| q |  | Query string |
| [type] | <code>derived</code> | Type of vizualisation to look for |
| page |  | Page number |
| per_page |  | Number of visualizations by page |

<a name="Rest+image"></a>

### rest.image(specs, [width], [height], [protocol], [format], [useCenter]) ⇒ <code>String</code>
Convert the given static definition into an image URL

**Kind**: instance method of [<code>Rest</code>](#Rest)  
**Returns**: <code>String</code> - Image URL  

| Param | Default | Description |
| --- | --- | --- |
| specs |  | Static definition |
| [width] | <code>300</code> | Image width |
| [height] | <code>170</code> | Image height |
| [protocol] | <code>https</code> | URL protocol |
| [format] | <code>png</code> | Image format |
| [useCenter] | <code>false</code> | The given definition uses center instead of boundaries to pane the map. |

<a name="Rest+data"></a>

### rest.data(id) ⇒ <code>Promise</code>
Get data for a given vizualisation using API v2

**Kind**: instance method of [<code>Rest</code>](#Rest)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | Id of the vizualisation |

<a name="Rest+vizSqlQuery"></a>

### rest.vizSqlQuery(id) ⇒ <code>Promise</code>
Get SQL query of a given vizualisation

**Kind**: instance method of [<code>Rest</code>](#Rest)  
**Returns**: <code>Promise</code> - SQL query as string  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | Id of the vizualisation |

<a name="Rest+vizRelatedTables"></a>

### rest.vizRelatedTables(id) ⇒ <code>Promise</code>
Get related table of a given vizualisation using API v1

**Kind**: instance method of [<code>Rest</code>](#Rest)  
**Returns**: <code>Promise</code> - A list of related tables  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | Id of the vizualisation |

<a name="Rest+vizTable"></a>

### rest.vizTable(id) ⇒ <code>String</code>
Get the name of table used by a given vizualisation

**Kind**: instance method of [<code>Rest</code>](#Rest)  
**Returns**: <code>String</code> - Table name  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | Id of the vizualisation |

<a name="Rest+fillParams"></a>

### rest.fillParams(sql) ⇒ <code>String</code>
Fills default parameters for a given SQL query template

**Kind**: instance method of [<code>Rest</code>](#Rest)  
**Returns**: <code>String</code> - SQL query  

| Param | Type | Description |
| --- | --- | --- |
| sql | <code>String</code> | SQL query template |

<a name="Rest+fields"></a>

### rest.fields(id) ⇒ <code>Array</code>
Get fields (table rows) for a given vizualization using API v2

**Kind**: instance method of [<code>Rest</code>](#Rest)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | Id of the vizualisation |

<a name="Rest.firstNonNul"></a>

### Rest.firstNonNul(tasks) ⇒ <code>Mixed</code>
Evaluate the given list of promises in series, then stops and return the
first non null value.

**Kind**: static method of [<code>Rest</code>](#Rest)  
**Returns**: <code>Mixed</code> - First non null value  

| Param | Type | Description |
| --- | --- | --- |
| tasks | <code>Array</code> | List of promises |

<a name="Rest.queryCollection"></a>

### Rest.queryCollection(data, path, force) ⇒ <code>Mixed</code>
Return the value of the given `path` in the `data object`

**Kind**: static method of [<code>Rest</code>](#Rest)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | Object to look into |
| path | <code>String</code> | Path to use |
| force | <code>Mixed</code> | Specify an object to be returned from the query if the query fails. |

<a name="Rest.sqlQueryToTable"></a>

### Rest.sqlQueryToTable(sql) ⇒ <code>String</code>
Get the table from a given SQL query

**Kind**: static method of [<code>Rest</code>](#Rest)  
**Returns**: <code>String</code> - Table name from the query (or null if any)  

| Param | Type | Description |
| --- | --- | --- |
| sql | <code>String</code> | SQL query |

<a name="Turbocarto"></a>

## Turbocarto
Class to manipulate TurboCARTO strings.

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
Populate the TurboCARTO strings with data from an SQL query in order to generate CartoCSS.

**Kind**: instance method of [<code>Turbocarto</code>](#Turbocarto)  

| Param | Type | Description |
| --- | --- | --- |
| turbocarto | <code>string</code> | TurboCARTO string. |
| sql | <code>string</code> | SQL query to read data. |

