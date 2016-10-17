(function(){

    var app = angular.module('people',[]);

    app.controller('PeopleController',function(){
        this.person = pro;


    });


    var pro = [
        {
            num: 0,
            name: 'Minnie',
            age: 26,
            p: "Hey, I am Minnie",
            gender: true, //true = female
            rate: 20,
            photo: 'http://placehold.it/400x250/000/fff',
            city: 'Vancouver',
            plane: true,
            car: true,
            bed: false,
            cutlery: false,
            camera: true
        },
        {
            num: 1,
            name: 'Kevin',
            age: 22,
            p:"I love Travelling",
            gender: true, //true = female
            rate: 15,
            photo: 'http://placehold.it/400x250/000/fff',
            city: 'Vancouver',
            plane: true,
            car: false,
            bed: false,
            cutlery: false,
            camera: true
        },
        {
            num: 2,
            name: 'Bob',
            age: 23,
            p:"great",
            gender: true, //true = female
            rate: 18,
            photo: 'http://placehold.it/400x250/000/fff',
            city: 'Vancouver',
            plane: true,
            car: true,
            bed: true,
            cutlery: false,
            camera: true
        },
        {
            num: 3,
            name: 'lee',
            age: 29,
            p:"great",
            gender: true, //true = female
            rate: 15,
            photo: 'http://placehold.it/400x250/000/fff',
            city: 'Vancouver',
            plane: true,
            car: false,
            bed: true,
            cutlery: false,
            camera: true
        },
        {
            num: 4,
            name: 'Lucy',
            age: 32,
            p:"great",
            gender: true, //true = female
            rate: 15,
            photo: 'http://placehold.it/400x250/000/fff',
            city: 'Vancouver',
            plane: true,
            car: true,
            bed: false,
            cutlery: false,
            camera: true
        }
    ];



})();