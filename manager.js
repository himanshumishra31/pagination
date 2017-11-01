//= require ./product.js
function StoreManager(data) {
  this.productsDiv = data.productsDiv;
  this.filterDiv = data.filterDiv;
  this.imageFolderUrl = data.imageFolderUrl;
  this.products = [];
  this.paginationBar = data.paginationBar;
  this.filteredProducts = [];
  this.selectPageNumber = "1";
  this.color = data.color;
  this.colorSelectorId = data.colorSelectorId;
  this.brand = data.brand;
  this.brandSelectorId = data.brandSelectorId;
  this.paginationArray = data.paginationArray;
  this.paginationId = data.paginationId;
  this.sortingId = data.sortingId;
  this.availableSelectorId = data.availableSelectorId;
  this.sortingData = data.sortingData;
  this.availability = data.availability;
  this.filter = data.filter;
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
      _this.initializeFilters();
      _this.createProducts();
      _this.checkPreviousSelectedFilter();
      _this.filterProducts();
      _this.createPaginationBar();
      _this.selectPage(_this.selectPageNumber);
      _this.showProducts();
      _this.bindEvents();
    },
    fail: function() {
      alert('Error occured');
      _this.init();
    }
  });
};

StoreManager.prototype.createCurrentSelectionURL = function() {
  this.selectedFilters = {
    color: this.getSelectedCheckbox(this.colorSelector),
    brand: this.getSelectedCheckbox(this.brandSelector),
    availability: this.getSelectedCheckbox(this.availableSelector),
    pagination: this.paginationDropdown.val(),
    sortBy: this.sortDropdown.val(),
    page: this.paginationBar.find('a.current').attr('value')
  };
  history.pushState(this.selectedFilters, '', '?' + decodeURI($.param(this.selectedFilters)).replace(/\[\]/g,''));
};

StoreManager.prototype.getSelectedCheckbox = function(filter) {
  var selectedCheckboxes = [];
  $.each(filter.find('input'), function() {
    if (this.checked) {
      selectedCheckboxes.push($(this).attr('value'));
    }
  });
  return selectedCheckboxes;
};

StoreManager.prototype.checkPreviousSelectedFilter = function() {
  var filtersWithValues = location.search.replace('?','').replace(/\%20/g, ' ').split('&');
  if(location.search) {
    for(var urlvalue of filtersWithValues) {
      var filterName = urlvalue.split('=')[0],
          filterValue =  urlvalue.split('=')[1];
      this.checkfilter(filterName, filterValue);
    }
  }
};

StoreManager.prototype.checkfilter = function(filterName, filterValue){
  if(filterName == 'brand' || filterName == 'color' || filterName == 'availability') {
    this.checkSelectedFilter(filterValue);
  }
  if(filterName == 'sortBy') {
    this.selectDropdownValue(filterValue, this.sortDropdown);
  }
  if(filterName == 'pagination') {
    this.selectDropdownValue(filterValue, this.paginationDropdown);
  }
  if(filterName == 'page') {
    this.selectPageNumber = filterValue;
  }
};

StoreManager.prototype.selectPage = function(pagenumber) {
  this.paginationBarLinks.each(function() {
    var that = $(this);
    if(that.attr('value') == pagenumber) {
      that.addClass('current');
    } else {
      that.removeClass('current');
    }
  });
};

StoreManager.prototype.selectDropdownValue = function(filterValue, filterDropwdown) {
  filterDropwdown.val(filterValue);
};

StoreManager.prototype.checkSelectedFilter = function(filterValue) {
  this.filterDiv.find('input').each(function() {
    if($(this).attr('value') == filterValue){
      $(this).attr('checked', true);
    }
  })
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
  this.showFilteredProducts(this.paginationBar.find('a.current').text() * this.paginationDropdown.val());
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
    });
    return match;
  } else {
    return true;
  }
};

StoreManager.prototype.filterProducts = function() {
  this.filteredProducts = [];
  this.colorCheckboxesChecked = this.colorSelector.find('input:checked');
  this.brandCheckboxesChecked = this.brandSelector.find('input:checked');
  this.availabilityCheckboxesChecked = this.availableSelector.find('input:checked');
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

StoreManager.prototype.createDiv = function(value) {
  return $('<div>', {id: value, data_attr: value});
};

StoreManager.prototype.createInputElement = function(inputType, value, inputName) {
  return $('<input>', {type: inputType, id: value, value: value, name: inputName});
};

StoreManager.prototype.createLabel = function(forValue, textValue){
  return $('<label>', {for: forValue}).text(textValue);
};

StoreManager.prototype.showFilteredProducts = function(endingIndex) {
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
  this.paginationBarLinks = this.paginationBar.find('a');
  this.paginationBarLinks.click(this.paginationLinkEvent());

}

StoreManager.prototype.eventHandler = function() {
  this.sortProducts();
  this.showFilteredProducts(this.paginationBar.find('a.current').text() * this.paginationDropdown.val());
  this.createCurrentSelectionURL();
};

StoreManager.prototype.filterEvent = function() {
  var _this = this;
  return function() {
    _this.productsDiv.empty();
    _this.filterProducts();
    _this.createPaginationBar();
    $(_this.paginationBarLinks[0]).addClass('current');
    _this.eventHandler();
  };
};

StoreManager.prototype.dropdownEvent = function() {
  var _this = this;
  return function() {
    _this.createPaginationBar();
    $(_this.paginationBarLinks[0]).addClass('current');
    _this.eventHandler();
  };
};

StoreManager.prototype.paginationLinkEvent = function() {
  var _this = this;
  return function() {
    $(this).addClass('current')
           .siblings().removeClass('current');
    _this.eventHandler();
  }
};

StoreManager.prototype.sortDropdownEvent = function() {
  var _this = this;
  return function() {
    _this.eventHandler();
  };
};

StoreManager.prototype.bindEvents = function() {
  this.filterDiv.on('change','input',this.filterEvent());
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
  this.createFilterCheckbox(this.color, this.colorSelectorId);
  this.createFilterCheckbox(this.brand, this.brandSelectorId);
  this.createAvailablityFilter();
  this.createPaginationFilter();
  this.createSortingFilter();
};

StoreManager.prototype.initializeFilters = function() {
  this.colorSelector = $('div[data_attr="colorSelector"]');
  this.brandSelector = $('div[data_attr="brandSelector"]');
  this.availableSelector = $('div[data_attr="availableSelector"]');
  this.colorSelectorCheckboxes = this.colorSelector.find('input');
  this.brandSelectorCheckboxes = this.brandSelector.find('input');
  this.availableSelectorCheckboxes = this.availableSelector.find('input');
  this.sortDropdown = $('select[data_attr="sortingFilter"]');
  this.paginationDropdown = $('select[data_attr="paginationFilter"]');
};


StoreManager.prototype.createSortingFilter = function() {
  var sortingByValue =  Object.keys(this.productdata[0]),
      filterFieldset = this.createFieldset(),
      filterLegend = this.createLegend('Sort By'),
      sortDropdown = this.createSelectElement(this.sortingId, this.sortingData);
  for(var sortvalue of sortingByValue) {
    if(sortvalue != 'url') {
      var dropdownOption = this.createOption(sortvalue);
      sortDropdown.append(dropdownOption);
    }
  }
  filterFieldset.append(filterLegend,sortDropdown);
  this.filterDiv.append(filterFieldset);
};

StoreManager.prototype.createPaginationFilter = function() {
  var paginationDropdown = this.createSelectElement('pagination', 'paginationFilter'),
      filterFieldset = this.createFieldset(),
      filterLegend = this.createLegend('Pagination');
  for(optionValue of this.paginationArray) {
    var option = this.createOption(optionValue);
    paginationDropdown.append(option);
  }
  filterFieldset.append(filterLegend, paginationDropdown);
  this.filterDiv.append(filterFieldset);
};

StoreManager.prototype.createAvailablityFilter = function() {
  var allfilterValues = this.getUniqueData('sold_out'),
      filterFieldset = this.createFieldset(),
      filterLegend = this.createLegend('Availability'),
      filterDiv = this.createDiv(this.availableSelectorId),
      checkboxAvailable = this.createInputElement('radio', '0', this.availability),
      checkboxLabel = this.createLabel('0', 'Available');
      checkboxAll = this.createInputElement('radio', '1', this.availability),
      checkboxAllLabel = this.createLabel('1', 'ALL');
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
    var filterCheckbox = this.createInputElement('checkbox', filterValue, this.filter),
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
    productsDiv: $('div[data-attr="productsView"]'),
    imageFolderUrl: 'product_data/images/',
    filterDiv: $('div[data-attr="filters"]'),
    paginationBar: $('div[data-attr="paginationBar"]'),
    color: 'color',
    colorSelectorId: 'colorSelector',
    brand: 'brand',
    brandSelectorId: 'brandSelector',
    availableSelectorId: 'availableSelector',
    paginationArray: [3,6,9],
    paginationId: 'pagination',
    sortingId: 'sorting',
    sortingData: 'sortingFilter',
    availability: 'availability',
    filter: 'filter'
    },
    storeManagerObject = new StoreManager(data);
  storeManagerObject.init();
});
