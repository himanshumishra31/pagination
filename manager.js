//= require ./product.js
function StoreManager(data) {
  this.productsDiv = data.productsDiv;
  this.filterDiv = data.filterDiv;
  this.imageFolderUrl = data.imageFolderUrl;
  this.products = [];
  this.paginationBar = data.paginationBar;
  this.filteredProducts = [];
}

StoreManager.prototype.init = function() {
  var _this = this;
  $.ajax({
    url : "product.json",
    type : "GET",
    dataType : 'json',
    success: function(jsonResponse) {
      _this.productdata = jsonResponse;
      _this.createFilter();
      _this.createProducts();
      _this.createPaginationBar();
      _this.showProducts();
      _this.bindEvents();
    },
    fail: function() {
      alert('Error occured');
      _this.init();
    }
  });
};

StoreManager.prototype.sort = function (sortBy) {
  return function(first, second) {
    if(!isNaN(first[sortBy])) {
      first[sortBy] = parseInt(first[sortBy]);
      second[sortBy] = parseInt(second[sortBy]);
    }
    if (first[sortBy] < second[sortBy])
      return -1;
    if (first[sortBy] > second[sortBy])
      return 1;
    return 0;
  };
};

StoreManager.prototype.sortProducts = function() {
  this.filteredProducts.sort(this.sort(this.sortDropdown.val()));
};

StoreManager.prototype.showProducts = function() {
  this.sortProducts();
  this.showFilteredImages(parseInt($(this.paginationBarLinks[0]).text()) * this.paginationDropdown.val());
  $(this.paginationBarLinks[0]).addClass('current');
};

StoreManager.prototype.createProducts = function() {
  var _this = this;
  $(this.productdata).each(function() {
    this.url = _this.imageFolderUrl + this.url;
    var product = new Product(this);
    _this.products.push(product);
    _this.filteredProducts.push(product);
  });
};

StoreManager.prototype.checkFilter = function(checkedCheckboxes, product, filterName) {
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

StoreManager.prototype.filteredImages = function() {
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
    if(_this.availabilityCheckboxesChecked.val() == 0 && this.sold_out == 1) {
      return ;
    }
    _this.filteredProducts.push(this);
  });
};

StoreManager.prototype.createLinkElement = function(value) {
  return $('<a>', {href: '#', value: value}).text(value + ' ');
};

StoreManager.prototype.createImgElement = function(idValue, srcValue) {
  return $('<img>', {id: idValue, src: srcValue });
};

StoreManager.prototype.createSelectElement = function(idValue, dataValue) {
  return $('<select>', {id: idValue, data_attr: dataValue });
};

StoreManager.prototype.createOption = function(value) {
  return $('<option>', {value: value}).text(value);
};

StoreManager.prototype.createFieldset = function() {
  return $('<fieldset>');
};

StoreManager.prototype.createLegend = function(textValue) {
  return $('<legend>', {align: 'center'}).text(textValue);
};

StoreManager.prototype.createDiv = function(divId) {
  return $('<div>', {id: divId});
};

StoreManager.prototype.createInputElement = function(inputType, value, inputName) {
  return $('<input>', {type: inputType, id: value, value: value, name: inputName});
};

StoreManager.prototype.createLabel = function(forValue, textValue){
  return $('<label>', {for: forValue}).text(textValue);
};

StoreManager.prototype.showFilteredImages = function(endingIndex) {
  var _this = this;
      startingIndex = endingIndex - this.paginationDropdown.val();
  this.productsDiv.empty();
  for(; startingIndex < endingIndex && startingIndex < this.filteredProducts.length ; startingIndex++) {
    var productImage = this.createImgElement('productImage', this.filteredProducts[startingIndex].url);

    this.productsDiv.append(productImage);
  }
};

StoreManager.prototype.createPaginationBar = function() {
  this.paginationBar.empty();
  var numberofPages = Math.ceil(this.filteredProducts.length / this.paginationDropdown.val());
  for( var pageNumber = 1 ; pageNumber <= numberofPages; pageNumber++) {
    var pageNumberLink = this.createLinkElement(pageNumber);
    this.paginationBar.append(pageNumberLink);
  }
  this.paginationBarLinks = $('#paginationBar a');
  this.paginationBarLinks.click(this.paginationLinkEvent());
}

StoreManager.prototype.eventHandling = function() {
  this.sortProducts();
  this.showFilteredImages(this.paginationBar.find('a.current').text() * this.paginationDropdown.val());

};

StoreManager.prototype.filterEvent = function() {
  var _this = this;
  return function() {
    _this.productsDiv.empty();
    _this.filteredImages();
    _this.createPaginationBar();
    $(_this.paginationBarLinks[0]).addClass('current');
    _this.eventHandling();
  };
};

StoreManager.prototype.dropdownEvent = function() {
  var _this = this;
  return function() {
    _this.createPaginationBar();
    $(_this.paginationBarLinks[0]).addClass('current');
    _this.eventHandling();
  };
};

StoreManager.prototype.paginationLinkEvent = function() {
  var _this = this;
  return function() {
    $(this).addClass('current')
           .siblings().removeClass('current');
    _this.eventHandling();
  }
};

StoreManager.prototype.sortDropdownEvent = function() {
  var _this = this;
  return function() {
    _this.eventHandling();
  };
};

StoreManager.prototype.bindEvents = function() {
  $('#filters input').on('change',this.filterEvent());
  this.paginationDropdown.change(this.dropdownEvent());
  this.sortDropdown.change(this.sortDropdownEvent());
};

StoreManager.prototype.displayProducts = function(product) {
  for(var product of this.products) {
    var productImage = this.createInputElement('productImage', product.url);
    this.productsDiv.append(productImage);
  }
};

StoreManager.prototype.createFilter = function() {
  this.createFilterCheckbox('color', 'colorSelector');
  this.createFilterCheckbox('brand', 'brandSelector');
  this.createAvailablityFilter();
  this.createPaginationFilter();
  this.createSortingFilter();
};

StoreManager.prototype.createSortingFilter = function() {
  var sortingByValue =  Object.keys(this.productdata[0]),
      filterFieldset = this.createFieldset(),
      filterLegend = this.createLegend('Sort By'),
      sortDropdown = this.createSelectElement('sorting', 'sortingFilter');
  for(var sortvalue of sortingByValue) {
    if(sortvalue != 'url') {
      var dropdownOption = this.createOption(sortvalue);
      sortDropdown.append(dropdownOption);
    }
  }
  filterFieldset.append(filterLegend,sortDropdown);
  this.filterDiv.append(filterFieldset);
  this.sortDropdown = $('select[data_attr="sortingFilter"]');
};

StoreManager.prototype.createPaginationFilter = function() {
  var paginationDropdown = this.createSelectElement('pagination', 'paginationFilter'),
      option1 = this.createOption('3'),
      option2 = this.createOption('6'),
      option3 = this.createOption('9'),
      filterFieldset = this.createFieldset(),
      filterLegend = this.createLegend('Pagination');
  paginationDropdown.append(option1, option2, option3);
  filterFieldset.append(filterLegend, paginationDropdown);
  this.filterDiv.append(filterFieldset);
  this.paginationDropdown = $('select[data_attr="paginationFilter"]');
};

StoreManager.prototype.createAvailablityFilter = function() {
  var allfilterValues = this.getUniqueData('sold_out'),
      filterFieldset = this.createFieldset(),
      filterLegend = this.createLegend('Availability'),
      filterDiv = this.createDiv('availableSelector'),
      checkboxAvailable = this.createInputElement('radio', '0', 'availability'),
      checkboxLabel = this.createLabel('0', 'Available');
      checkboxAll = this.createInputElement('radio', 'all', 'availability'),
      checkboxAllLabel = this.createLabel('all', 'ALL');
  filterFieldset.append(filterLegend, filterDiv);
  filterDiv.append(checkboxAvailable, checkboxLabel, checkboxAll, checkboxAllLabel);
  this.filterDiv.append(filterFieldset);
};

StoreManager.prototype.createFilterCheckbox = function(filterName, selectorId) {
  var allfilterValues = this.getUniqueData(filterName),
      filterFieldset = this.createFieldset(),
      filterLegend = this.createLegend(filterName),
      filterDiv = this.createDiv(selectorId);
  this.filterDiv.append(filterFieldset);
  filterFieldset.append(filterLegend, filterDiv);
  for(var filterValue of allfilterValues) {
    var filterCheckbox = this.createInputElement('checkbox', filterValue, 'filter'),
        checkboxLabel = this.createLabel(filterValue, filterValue);
    filterDiv.append(filterCheckbox, checkboxLabel);
  }
};

StoreManager.prototype.getUniqueData = function(filter) {
  var uniqueValues = [];
  $(this.productdata).each(function() {
    if(uniqueValues.indexOf(this[filter]) == -1){
      uniqueValues.push(this[filter]);
    }
  });
  return uniqueValues;
};

$(document).ready(function() {
  var data = {
    productsDiv: $('#productsView'),
    imageFolderUrl: 'product_data/images/',
    filterDiv: $('#filters'),
    paginationBar: $('#paginationBar')
    },
    storeManagerObject = new StoreManager(data);
  storeManagerObject.init();
});
