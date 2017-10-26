function Manager(data) {
  this.productsDiv = data.productsDiv;
  this.filterDiv = data.filterDiv;
  this.imageFolderUrl = data.imageFolderUrl;
  this.products = [];
  this.paginationBar = data.paginationBar;
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
    _this.filteredProducts.push(product);
  })
  this.createPaginationBar();
  this.showFilteredImages(parseInt($(_this.paginationBarLinks[0]).text()) * _this.paginationDropdown.val());
  $(this.paginationBarLinks[0]).addClass('current');
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

Manager.prototype.showFilteredImages = function(endingIndex) {
  var _this = this,
      startingIndex = endingIndex - this.paginationDropdown.val();
  this.productsDiv.text('');
  for(; startingIndex < endingIndex && startingIndex < this.filteredProducts.length ; startingIndex++) {
    var productImage = $('<img>', {src: this.filteredProducts[startingIndex].url, id: 'productImage'});
    this.productsDiv.append(productImage);
  }
};

Manager.prototype.createPaginationBar = function() {
  this.paginationBar.text('');
  var numberofPages = Math.ceil(this.filteredProducts.length / this.paginationDropdown.val());
  for( var pageNumber = 1 ; pageNumber <= numberofPages; pageNumber++) {
    var pageNumberLink = $('<a>', {href: '#' , value: pageNumber}).text(pageNumber + ' ');
    this.paginationBar.append(pageNumberLink);
  }
  this.paginationBarLinks = $('#paginationBar a');
  this.paginationBarLinks.click(this.paginationLinkEvent());
}

Manager.prototype.handleEvent = function() {
  var _this = this;
  return function() {
    _this.productsDiv.empty();
    _this.filteredImages();
    _this.showFilteredImages(parseInt($(_this.paginationBarLinks[0]).text()) * _this.paginationDropdown.val());
    _this.createPaginationBar();
    $(_this.paginationBarLinks[0]).addClass('current');
  };
};

Manager.prototype.dropdownEvent = function() {
  var _this = this;
  return function() {
    _this.createPaginationBar();
    _this.showFilteredImages(parseInt($(_this.paginationBarLinks[0]).text()) * _this.paginationDropdown.val());
  };
};

Manager.prototype.paginationLinkEvent = function() {
  var _this = this;
  return function() {
    var imagesPerPage = parseInt($(this).text()) * _this.paginationDropdown.val() ;
    $(this).addClass('current')
           .siblings().removeClass('current');
    _this.showFilteredImages(imagesPerPage);
  }
};

Manager.prototype.bindEvents = function() {
  $('#filters input').on('change',this.handleEvent());
  this.paginationDropdown.change(this.dropdownEvent());
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
  this.createPaginationFilter();
};

Manager.prototype.createPaginationFilter = function() {
  var paginationDropdown = $('<select>', { id: 'pagination'}).text('sfa'),
      option1 = $('<option>', {value: 3}).text('3'),
      option2 = $('<option>', {value: 6}).text('6'),
      option3 = $('<option>', {value: 9}).text('9'),
      filterFieldset = $('<fieldset>'),
      filterLegend = $('<legend>', {align: 'center'}).text('Pagination');
  paginationDropdown.append(option1, option2, option3);
  filterFieldset.append(filterLegend, paginationDropdown);
  this.filterDiv.append(filterFieldset);
  this.paginationDropdown = $('#pagination');
}

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
  filterFieldset.after($('<br>'));
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
    filterDiv: $('#filters'),
    paginationBar: $('#paginationBar')
    },
    managerObject = new Manager(data);
  managerObject.init();
})
