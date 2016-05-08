var SearchForm = React.createClass({
  getInitialState: function () {
    return {
      data:[] ,
      myFoods:this.props.myFoods,
      timer:0,
      isLoading:false
    }
  },
  handleAdd:function(item){
    var foods = this.props.myFoods;
    foods.push(item);
    localStorage.setItem('SelectedFoods', JSON.stringify(foods));
    this.setState({ myFoods: foods });
    //console.log(item);
  },
  handleDelete:function(item){
    var foods = this.props.myFoods;
    foods.splice(foods.indexOf(item), 1);
    localStorage.setItem('SelectedFoods', JSON.stringify(foods));
    this.setState({ myFoods: foods });
  },
  handledeleteAll:function(){
    //alert here
    var r = confirm("Do you want to delete all of "+this.state.myFoods.length+" meals?");
    if (r == true) {
      localStorage.setItem('SelectedFoods', JSON.stringify([]));
      this.setState({ myFoods: []});
    }
  },
  render:function(){
    var that = this;
    
    return (<div className="searchForm"><div className="cont">
        <div className="results"><h2>Search Food: </h2>
        <input type="text" placeholder="Search for a food"
              onChange={that.onChangeHandler} />{ this.state.isLoading ? <div className="loader"></div> : null }
        <ul className="suggestions">{this.state.data.map(function(m,i){
              return <SearchResultItem key={i} item={m} add={that.handleAdd}/>
          })}
          </ul>
          </div>
        <div className="myFoods"><h2>Selected Foods:{that.state.myFoods.length}</h2><button onClick={this.handledeleteAll}>delete all</button>
          {this.state.myFoods.map(function(b,l){return <SavedFoodsItem key={l} item={b} deleteHandler={that.handleDelete}/>})}
          </div>
          </div>
      </div>);
  },
  onChangeHandler:function(e){
     var word = e.target.value,
         that = this;

    if(word !== ""){
      clearTimeout(this.state.timer);
      this.setState({ isLoading: true});
      this.state.timer = setTimeout(function() {
        query(word).then(function(data){
          that.setState({ isLoading: false});
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
    return <div className="savedItem"><button onClick={this.handleDelete}></button><Section title={this.props.item.Name}><h4>Portions:</h4> {this.props.item.Portions.map(function(p, i){
      var nutrients = p['nutrients']; 
      return <Section title={p['name']} key={i}>{
        Object.keys(nutrients).map(function (key, t) {
          if(!(Object.keys(nutrients[key]).length === 0 || nutrients[key].length === 0)){
            return <Section title={key} key={t}>{
              Object.keys(nutrients[key]).map(function (key2, m) {
                //return <Section title={key2} key={m}>{nutrients[key][key2] != null ? nutrients[key][key2]["value"] + nutrients[key][key2]["unit"] : "0"}</Section>
                return (<div key={m}>{key2} : {<span className="bold">{ nutrients[key][key2] != null ? nutrients[key][key2]["value"] + nutrients[key][key2]["unit"] : "0"}</span>}</div>)
              })
            }</Section>
          }
        })
      }
    </Section>})}</Section></div>
  }
});


var Section = React.createClass({
  handleClick: function(){
    if(this.state.open) {
      this.setState({
        open: false,
        class: "section"
      });
    }else{
      this.setState({
        open: true,
        class: "section open"
      });
    }
  },
  getInitialState: function(){
     return {
       open: false,
       class: "section"
     }
  },
  render: function() {
    return (
      <div className={this.state.class}>
        <div className="sectionhead" onClick={this.handleClick}>{this.props.title}</div>
        <div className="articlewrap">
          <div className="article">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
});


var selectedFoods = JSON.parse(localStorage.getItem('SelectedFoods')) || [];
ReactDOM.render(<SearchForm myFoods={selectedFoods}/>, document.getElementById('container'));
