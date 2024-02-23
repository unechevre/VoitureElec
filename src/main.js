


import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		ready: false,
	}
});


window.initMap = function ready() {
	app.$set({ ready: true });
}

export default app;

// import App from './App.svelte';

// const app = new App({
//   target: document.body,
//   props: {
//     ready: false,
//   }
// });

// window.initMap = function() {
//   app.$set({ ready: true });
// }

// export default app;

// const carInstance = new Car({
//   target: document.body,
//   props: {
//     ready: false, // Remplacez par les props nécessaires, si votre composant en a besoin
//   }
// });

// export default carInstance;

// const testInstance = new Test({
//   target: document.body,
//   props: {
//     ready: false, // Remplacez par les props nécessaires, si votre composant en a besoin
//   }
// });

// export default testInstance;





