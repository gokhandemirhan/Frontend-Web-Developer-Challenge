var SearchForm = React.createClass({
  getInitialState: function () {
    return {
      data:[] ,
      myFoods:this.props.myFoods
    }
  },
  handleAdd:function(item){
    var foods = this.props.myFoods;
    foods.push(item);
    localStorage.setItem('SelectedFoods', JSON.stringify(foods));

    var data = this.state.data;
    data.splice(data.indexOf(item), 1);

    this.setState({ myFoods: foods,data:data });
    //console.log(item);
  },
  handleDelete:function(item){
    var foods = this.props.myFoods;
    foods.splice(foods.indexOf(item), 1);
    localStorage.setItem('SelectedFoods', JSON.stringify(foods));
    this.setState({ myFoods: foods });
  },
  render:function(){
    var that = this;
    return (<div className="searchForm"><div className="cont">
        <div className="results"><h2>Search Food: </h2>
        <input type="text" placeholder="Search for a food"
              onChange={that.onChangeHandler} />
        <ul className="suggestions">{this.state.data.map(function(m){
              return <SearchResultItem key={m.ID} item={m} add={that.handleAdd}/>
          })}
          </ul>
          </div>
        <div className="myFoods"><h2>Selected Foods:{that.state.myFoods.length}</h2>
          <ol>
          {this.state.myFoods.map(function(b){return <SavedFoodsItem key={b.ID} item={b} deleteHandler={that.handleDelete}/>})}
          </ol></div>
          </div>
      </div>);
  },
  onChangeHandler:function(e){
     var word = e.target.value,
         that = this;

          var timer;
          clearTimeout(timer);
    if(word !== ""){
      
      timer = setTimeout(function() {
        query(word).then(function(data){
          //console.log(data);
          data = JSON.parse(data);
          var items = data.map(function(n){return {ID:n._id,Name:n.name,  Portions:n.portions}});
          that.setState({data: items});
        });
       }, 2000);
    }else{
      that.setState({data: []});
    }
  }
                                   
});


var query = function(word) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://test.holmusk.com/food/search?q="+word);
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(xhr.response);
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    };
    xhr.send();
  });
}


var SearchResultItem = React.createClass({
  handleAdd:function(){
    this.props.add(this.props.item)
  },
  render:function(){
    return (<li onClick={this.handleAdd}>{this.props.item.Name}</li>)
  }
  
});

var SavedFoodsItem = React.createClass({
  handleDelete:function(){
    this.props.deleteHandler(this.props.item)
  },
  render:function(){
    return <li onClick={this.handleDelete}>{this.props.item.Name} <br/>Servings: <ul>{this.props.item.Portions.map(function(p){return <li>{p['name']}</li>})}</ul></li>
  }
});


var selectedFoods = JSON.parse(localStorage.getItem('SelectedFoods')) || [];
ReactDOM.render(<SearchForm myFoods={selectedFoods}/>, document.getElementById('container'));
