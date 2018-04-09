import Vue from 'vue';
import Vuex from 'vuex';

import axios from 'axios';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: {},
    loggedIn: false,
    loginError: '',
    registerError: '',
    feed: [],
    userView: [],
    feedView: [],
  },
  getters: {
    user: state => state.user,
    loggedIn: state => state.loggedIn,
    loginError: state => state.loginError,
    registerError: state => state.registerError,
    feed: state => state.feed,
    feedView: state => state.feedView,
    userView: state => state.userView,
  },
  mutations: {
    setUser (state, user) {
      state.user = user;
    },
    setLogin (state, status) {
      state.loggedIn = status;
    },
    setLoginError (state, message) {
      state.loginError = message;
    },
    setRegisterError (state, message) {
      state.registerError = message;
    },
    setFeed (state, feed) {
      state.feed = feed;
    },
    setUserView (state, user) {
      state.userView = user;
    },
    setFeedView (state, feed) {
      state.feedView = feed;
    },
  },
  actions: {
    // Registration, Login // START REGISTER
    register(context,user) {
      axios.post("/api/users",user).then(response => {
	context.commit('setUser', response.data.user);
	context.commit('setLogin',true);
	context.commit('setRegisterError',"");
	context.commit('setLoginError',"");
      }).catch(error => {
	context.commit('setLoginError',"");
	context.commit('setLogin',false);
	if (error.response) {
	  if (error.response.status === 403)
	    context.commit('setRegisterError',"That email address already has an account.");
	  else if (error.response.status === 409)
	    context.commit('setRegisterError',"That user name is already taken.");
	  return;
	}
	context.commit('setRegisterError',"Sorry, your request failed. We will look into it.");
      });
    },
      //END REGISTER START LOGIN
      
    login(context,user) {
      axios.post("/api/login",user).then(response => {
	context.commit('setUser', response.data.user);
	context.commit('setLogin',true);
	context.commit('setRegisterError',"");
	context.commit('setLoginError',"");
      }).catch(error => {
	context.commit('setRegisterError',"");
	if (error.response) {
	  if (error.response.status === 403 || error.response.status === 400)
	    context.commit('setLoginError',"Invalid login.");
	  context.commit('setRegisterError',"");
	  return;
	}
	context.commit('setLoginError',"Sorry, your request failed. We will look into it.");
      });
    },
    //END LOGIN, START LOGOUT
    logout(context,user) {
      context.commit('setUser', {});
      context.commit('setLogin',false);
    },
    //END LOGOUT START TWEETING (get FEED
    // Tweeting //
    getFeed(context) {
      axios.get("/api/users/" + context.state.user.id + "/tweets").then(response => {
	context.commit('setFeed',response.data.tweets);
      }).catch(err => {
	console.log("getFeed failed:",err);
      });
    },
    //END GET START POST

    addTweet(context,tweet) {
      axios.post("/api/users/" + context.state.user.id + "/tweets",tweet).then(response => {
	return context.dispatch('getFeed');
      }).catch(err => {
	console.log("addTweet failed:",err);
      });
    },
  //END POST END TWEETING
  },
  //THis will do the searching for the app
  doSearch(context,keywords) {
    axios.get("/api/tweets/search?keywords=" + keywords).then(response => {
      context.commit('setFeed',response.data.tweets);
    }).catch(err => {
      console.log("doSearch failed:",err);
    });
  },
  // Users //
  // get a user, must supply {username: username} of user you want to get
  getUser(context,user) {
    return axios.get("/api/users/" + user.id).then(response => {
      context.commit('setUserView',response.data.user);
    }).catch(err => {
      console.log("getUser failed:",err);
    });
  },  
// get tweets of a user, must supply {id:id} of user you want to get tweets for
  getUserTweets(context,user) {
    return axios.get("/api/users/" + user.id + "/tweets").then(response => {
      context.commit('setFeedView',response.data.tweets);
    }).catch(err => {
      console.log("getUserTweets failed:",err);
    });
  },
  //HASHTAG SEARCH
  doHashTagSearch(context,hashtag) {
    axios.get("/api/tweets/hash/" + hashtag).then(response => {
      context.commit('setFeed',response.data.tweets);
    }).catch(err => {
      console.log("doHashTagSearch failed:",err);
    });
  }
});
