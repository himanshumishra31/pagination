function Product(data, imageFolderUrl) {
  this.name = data.name;
  this.url = imageFolderUrl + data.url;
  this.color = data.color;
  this.brand = data.brand;
  this.soldOut = data.sold_out;
}
