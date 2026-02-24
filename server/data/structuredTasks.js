export const structuredTasks = {
  Beginner: {
    logic_error: [
      { task: "Print the sum of 5 and 10.", test_input: "", expected_output: "15" },
      { task: "Print the result of 3 multiplied by 4.", test_input: "", expected_output: "12" }
    ],
    syntax_error: [
      { task: "Create a variable x = 10 and print it.", test_input: "", expected_output: "10" },
      { task: "Create a variable name = 'Alice' and print it.", test_input: "", expected_output: "Alice" }
    ],
    infinite_loop: [
      { task: "Print numbers from 1 to 3 using a for loop.", test_input: "", expected_output: "1\n2\n3" },
      { task: "Print numbers from 1 to 5 using a for loop.", test_input: "", expected_output: "1\n2\n3\n4\n5" }
    ],
    missing_base_case: [
      { task: "Write a function factorial(n) that returns factorial of n. Print factorial(3).", test_input: "", expected_output: "6" },
      { task: "Write a recursive function to sum numbers from 1 to n. Print sum(4).", test_input: "", expected_output: "10" }
    ],
    no_function: [
      { task: "Write a function add(a, b) that returns a+b. Print add(3, 4).", test_input: "", expected_output: "7" },
      { task: "Write a function that returns double of a number. Print double(5).", test_input: "", expected_output: "10" }
    ],
    missing_print: [
      { task: "Calculate 6 + 3 and print the result.", test_input: "", expected_output: "9" },
      { task: "Calculate 10 - 4 and print the result.", test_input: "", expected_output: "6" }
    ],
    hardcoded_value: [
      { task: "Print the result of 4 * 5 using multiplication operator.", test_input: "", expected_output: "20" },
      { task: "Print the result of 8 + 7 using addition operator.", test_input: "", expected_output: "15" }
    ],
    idle_stuck: [
      { task: "Print the word Hello.", test_input: "", expected_output: "Hello" },
      { task: "Print the number 42.", test_input: "", expected_output: "42" }
    ]
  },

  Intermediate: {
    logic_error: [
      { task: "Print the sum of all numbers from 1 to 10.", test_input: "", expected_output: "55" },
      { task: "Print whether 17 is prime (True or False).", test_input: "", expected_output: "True" }
    ],
    syntax_error: [
      { task: "Write a function is_even(n) that returns True if n is even. Print is_even(4).", test_input: "", expected_output: "True" },
      { task: "Write a list of 3 fruits and print the second one.", test_input: "", expected_output: "banana" }
    ],
    infinite_loop: [
      { task: "Use a while loop to print numbers from 5 down to 1.", test_input: "", expected_output: "5\n4\n3\n2\n1" },
      { task: "Print even numbers from 2 to 10 using a loop.", test_input: "", expected_output: "2\n4\n6\n8\n10" }
    ],
    missing_base_case: [
      { task: "Write a recursive function to compute factorial of 5. Print the result.", test_input: "", expected_output: "120" },
      { task: "Write a recursive function to compute the 6th Fibonacci number. Print it.", test_input: "", expected_output: "8" }
    ],
    no_function: [
      { task: "Write a function that checks if 6 is even and print True or False.", test_input: "", expected_output: "True" },
      { task: "Write a function max_of_two(a, b) that returns the larger number. Print max_of_two(3, 7).", test_input: "", expected_output: "7" }
    ],
    missing_print: [
      { task: "Write a function to find the square of 9 and print the result.", test_input: "", expected_output: "81" },
      { task: "Compute the length of the string 'hello world' and print it.", test_input: "", expected_output: "11" }
    ],
    hardcoded_value: [
      { task: "Print the factorial of 4 by computing it, not hardcoding.", test_input: "", expected_output: "24" },
      { task: "Compute and print 2 raised to the power of 8.", test_input: "", expected_output: "256" }
    ],
    idle_stuck: [
      { task: "Print all odd numbers between 1 and 9.", test_input: "", expected_output: "1\n3\n5\n7\n9" },
      { task: "Print the square of numbers 1 to 4.", test_input: "", expected_output: "1\n4\n9\n16" }
    ]
  },

  Advanced: {
    logic_error: [
      { task: "Print all prime numbers between 1 and 20.", test_input: "", expected_output: "2\n3\n5\n7\n11\n13\n17\n19" },
      { task: "Print the GCD of 48 and 18.", test_input: "", expected_output: "6" }
    ],
    syntax_error: [
      { task: "Write a class Rectangle with width=4 and height=5. Print its area.", test_input: "", expected_output: "20" },
      { task: "Write a list comprehension to get squares of 1 to 5 and print it.", test_input: "", expected_output: "[1, 4, 9, 16, 25]" }
    ],
    infinite_loop: [
      { task: "Use binary search to find index of 7 in [1,3,5,7,9]. Print the index.", test_input: "", expected_output: "3" },
      { task: "Print the first 8 Fibonacci numbers.", test_input: "", expected_output: "0\n1\n1\n2\n3\n5\n8\n13" }
    ],
    missing_base_case: [
      { task: "Write a recursive binary search. Search for 5 in [1,2,3,4,5,6]. Print its index.", test_input: "", expected_output: "4" },
      { task: "Write a recursive power function. Print power(2, 10).", test_input: "", expected_output: "1024" }
    ],
    no_function: [
      { task: "Write a function that returns the nth Fibonacci number recursively. Print fib(7).", test_input: "", expected_output: "13" },
      { task: "Write a function is_palindrome(s). Print is_palindrome('racecar').", test_input: "", expected_output: "True" }
    ],
    missing_print: [
      { task: "Compute the sum of squares of numbers from 1 to 5 and print it.", test_input: "", expected_output: "55" },
      { task: "Count vowels in 'programming' and print the count.", test_input: "", expected_output: "3" }
    ],
    hardcoded_value: [
      { task: "Print the factorial of 6 by writing the computation, not the answer.", test_input: "", expected_output: "720" },
      { task: "Compute and print the sum of digits of 12345.", test_input: "", expected_output: "15" }
    ],
    idle_stuck: [
      { task: "Write a function to reverse a string. Print reverse('python').", test_input: "", expected_output: "nohtyp" },
      { task: "Print the largest element in [3, 1, 4, 1, 5, 9, 2, 6].", test_input: "", expected_output: "9" }
    ]
  }
};