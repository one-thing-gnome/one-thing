# pcalc

A text-based calculator that lives on the gnome panel (top bar), out of the way
of your work.

In it's default configuration, the calculator provides a text entry field on the
panel into which a mathematical expression can be entered for evaluation; the
calculator also provides an icon next to the entry field that can be pressed
(clicked) to present a popup that has a larger entry field and help information.

The calculator can be configured to disable the entry field on the panel so that
only the icon appears there; pressing (clicking) the icon presents the popup
having the larger entry field.

The calculator can also be configured to not show help information on the popup,
in which case the popup will have the larger entry field by itself.
## Basic guide for expressions
An example of an expression is 2+4*8, which means multiply 4 by 8 and add 2 to
the result.

Supported operators:\
&nbsp;&nbsp;&nbsp;&nbsp;+ for addition\
&nbsp;&nbsp;&nbsp;&nbsp;- for subtraction and negation\
&nbsp;&nbsp;&nbsp;&nbsp;* for multiplication\
&nbsp;&nbsp;&nbsp;&nbsp;/ for division\
&nbsp;&nbsp;&nbsp;&nbsp;^ or ** for exponentiation (right-associative)

Use parentheses to override operator precedence; e.g.,
(2+4)*8 means add 2 to 4 and multiply the result by 8.

Numbers can have a 0b, 0o or 0x prefix, or can be
specified in scientific E notation; e.g., 0b11011001,
0o331, 0xd9 and 2.17e+2 all specify the number 217.

The following special values and functions are available:\
&nbsp;&nbsp;&nbsp;&nbsp;pi : Did you know that March 14 is Pi day?\
&nbsp;&nbsp;&nbsp;&nbsp;e : Euler\'s number\
&nbsp;&nbsp;&nbsp;&nbsp;last : The last calculated value\
&nbsp;&nbsp;&nbsp;&nbsp;abs(x) : Absolute value of x\
&nbsp;&nbsp;&nbsp;&nbsp;acos(x) : Arccosine of x, in radians\
&nbsp;&nbsp;&nbsp;&nbsp;acosh(x) : Hyperbolic arccosine of x\
&nbsp;&nbsp;&nbsp;&nbsp;asin(x) : Arcsine of x, in radians\
&nbsp;&nbsp;&nbsp;&nbsp;asinh(x) : Hyperbolic arcsine of x\
&nbsp;&nbsp;&nbsp;&nbsp;atan(x) : Arctangent of x between -pi and pi radians\
&nbsp;&nbsp;&nbsp;&nbsp;atan2(y, x) : Arctangent of the quotient of its arguments\
&nbsp;&nbsp;&nbsp;&nbsp;atanh(x) : Hyperbolic arctangent of x\
&nbsp;&nbsp;&nbsp;&nbsp;cbrt(x) : Cubic root of x\
&nbsp;&nbsp;&nbsp;&nbsp;ceil(x) : x rounded upwards to the nearest integer\
&nbsp;&nbsp;&nbsp;&nbsp;cos(x) : Cosine of x (x is in radians)\
&nbsp;&nbsp;&nbsp;&nbsp;cosh(x) : Hyperbolic cosine of x\
&nbsp;&nbsp;&nbsp;&nbsp;exp(x) : Value of e raised to the power of x\
&nbsp;&nbsp;&nbsp;&nbsp;floor(x) : x rounded downwards to the nearest integer\
&nbsp;&nbsp;&nbsp;&nbsp;ln(x) or log(x) : Natural logarithm (base e) of x\
&nbsp;&nbsp;&nbsp;&nbsp;random() : Random number between 0 and 1\
&nbsp;&nbsp;&nbsp;&nbsp;round(x) : Rounds x to the nearest integer\
&nbsp;&nbsp;&nbsp;&nbsp;sin(x) : Sine of x (x is in radians)\
&nbsp;&nbsp;&nbsp;&nbsp;sinh(x) : Hyperbolic sine of x\
&nbsp;&nbsp;&nbsp;&nbsp;sqrt(x) : Square root of x\
&nbsp;&nbsp;&nbsp;&nbsp;tan(x) : Tangent of an angle\
&nbsp;&nbsp;&nbsp;&nbsp;tanh(x) : Hyperbolic tangent of a number\
&nbsp;&nbsp;&nbsp;&nbsp;trunc(x) : Integer part of a number x
## Manual installation notes
- Run **make** (or **make all**) from the project folder to compile the schema
- Place the folder in **~/.local/share/gnome-shell/extensions**
- Rename the folder to **pcalc<span>@</span>mgeck64.github.com** so the gnome
shell will find it
- Makefile, .gitignore and this file can be deleted (optional)
- Reset the gnome shell (if under X11 then press **Alt-F2** and then submit the
    **r** command; else if under Wayland then log out and log back in)
