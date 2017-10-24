function Manager(data) {
  this.productsDiv = data.productsDiv;
  this.filterDiv = data.filterDiv;
  this.imageFolderUrl = data.imageFolderUrl;
  this.products = [];
  this.filteredProducts = [];
}

Manager.prototype.init = function() {
  var _this = this;
  $.ajax({
    url : "product.json",
    type : "GET",
    dataType : 'json',
  }).done(function(jsonResponse) {
    _this.productdata = jsonResponse;
    _this.createFilter();
    _this.createProducts();
    _this.displayProducts();
    _this.bindEvents();
  }).fail(function() {
    alert("Error occured");
  });
};

Manager.prototype.createProducts = function() {
  var _this = this;
  $(this.productdata).each(function() {
    var product = new Product(this, _this.imageFolderUrl);
    _this.products.push(product);
  })
};

Manager.prototype.checkFilter = function(checkedCheckboxes, product, filterName) {
  if(checkedCheckboxes.length) {
    var match = false;
    checkedCheckboxes.each(function() {
      if(this.value == product[filterName]) {
        match = true;
      }
    })
    return match;
  } else {
    return true;
  }
};

Manager.prototype.filteredImages = function() {
  this.filteredProducts = [];
  this.colorCheckboxesChecked = $('#colorSelector input:checked');
  this.brandCheckboxesChecked = $('#brandSelector input:checked');
  this.availabilityCheckboxesChecked = $('#availableSelector input:checked');
  var _this = this;
  $(this.products).each(function() {
    if(! _this.checkFilter(_this.colorCheckboxesChecked, this, 'color')) {
      return ;
    }
    if(! _this.checkFilter(_this.brandCheckboxesChecked, this, 'brand')) {
      return ;
    }
    if(_this.availabilityCheckboxesChecked.val() == 0 && this.soldOut == 1) {
      return ;
    }
    _this.filteredProducts.push(this);
  })
};

Manager.prototype.showFilteredImages = function() {
  var _this = this;
  $(this.filteredProducts).each(function() {
    var productImage = $('<img>', {src: this.url, id: 'productImage'});
    _this.productsDiv.append(productImage);
  })
};

Manager.prototype.handleEvent = function() {
  var _this = this;
  return function() {
    _this.productsDiv.empty();
    _this.filteredImages();
    _this.showFilteredImages();
  };
};

Manager.prototype.bindEvents = function() {
  $('#filters input').on('change',this.handleEvent());
};

Manager.prototype.displayProducts = function(product) {
  for(var product of this.products) {
    var productImage = $('<img>', {src: product.url, id: 'productImage'});
    this.productsDiv.append(productImage);
  }
};

Manager.prototype.createFilter = function() {
  this.createFilterCheckbox('color', 'colorSelector');
  this.createFilterCheckbox('brand', 'brandSelector');
  this.createAvailablityFilter();
};

Manager.prototype.createAvailablityFilter = function() {
  var allfilterValues = this.getUniqueData('sold_out'),
      filterFieldset = $('<fieldset>'),
      filterLegend = $('<legend>', {align: 'center'}).text('Availability'),
      filterDiv = $('<div>', {id: 'availableSelector'}),
      checkboxAvailable = $('<input>', {type: 'radio', id: '0', value: '0', name: 'availability'}),
      checkboxLabel = $('<label>', {for: '0'}).text('Available'),
      checkboxAll = $('<input>', {type: 'radio', id: 'all', value: 'all', name: 'availability'}),
      checkboxAllLabel = $('<label>', {for: 'all'}).text('ALL');
  this.filterDiv.append(filterFieldset);
  filterFieldset.append(filterLegend, filterDiv);
  filterDiv.append(checkboxAvailable, checkboxLabel, checkboxAll, checkboxAllLabel);
};

Manager.prototype.createFilterCheckbox = function(filterName, selectorId) {
  var allfilterValues = this.getUniqueData(filterName),
      filterFieldset = $('<fieldset>'),
      filterLegend = $('<legend>', {align: 'center'}).text(filterName),
      filterDiv = $('<div>', {id: selectorId});
  this.filterDiv.append(filterFieldset);
  filterFieldset.append(filterLegend, filterDiv);
  for(var filterValue of allfilterValues) {
    var filterCheckbox = $('<input>', {type: 'checkbox', id: filterValue, value: filterValue} ),
        checkboxLabel = $('<label>', {for: filterValue }).text(filterValue);
    filterDiv.append(filterCheckbox, checkboxLabel);
  }
  filterFieldset.after($('<br>'));
};

Manager.prototype.getUniqueData = function(filter) {
  var uniqueValues = new Set();
  $(this.productdata).each(function() {
    uniqueValues.add(this[filter]);
  });
  return uniqueValues;
};

$(document).ready(function() {
  var data = {
    productsDiv: $('#productsView'),
    imageFolderUrl: 'product_data/images/',
    filterDiv: $('#filters')
    },
    managerObject = new Manager(data);
  managerObject.init();
})
