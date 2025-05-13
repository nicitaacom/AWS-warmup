"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const emails = [
    {
        subject: 'Your Satisfaction is Our Priority',
        body: 'Hi! We’re committed to making your car look its best. Let’s get to work!',
    },
    {
        subject: 'Let Us Handle the Details',
        body: 'Hello! From interior to exterior, we’ve got your detailing needs covered.',
    },
    {
        subject: 'Make Your Car Feel New Again',
        body: 'Hi! Let us bring back that new car feeling with a professional detail.',
    },
    {
        subject: 'Drive in Confidence',
        body: 'Hey! A clean car is a confident car. Let’s get yours detailed today!',
    },
    {
        subject: 'We’ve Got You Covered',
        body: 'Hi! Whatever your car needs, our detailing services have you covered.',
    },
    {
        subject: 'Protect Your Car, Love Your Drive',
        body: 'Hello! Detailing protects your car and enhances every drive. Let’s book your appointment!',
    },
    {
        subject: 'Your Ride, Reimagined',
        body: 'Hi! Let us show you what your car is capable of with a professional detail.',
    },
    {
        subject: 'Get Ready to Shine',
        body: 'Hey! Your car deserves to sparkle. Let’s make it happen today!',
    },
    {
        subject: 'A Car That Turns Heads',
        body: 'Hey! A professionally detailed car doesn’t just drive better—it gets noticed. Let’s give your car the attention it deserves. Book your session today: http://nicitaa.com/appointment.',
    },
    {
        subject: 'We Know What Your Car Needs',
        body: 'Hi there! Every car has its own story, and we’re here to make sure yours always looks its best. Let’s create a custom care plan for you: http://nicitaa.com/appointment.',
    },
    {
        subject: 'Don’t Wait for the Dirt to Pile Up',
        body: 'Hello! Regular detailing prevents dirt and grime from building up and causing long-term damage. Let’s keep your car looking like new: http://nicitaa.com/appointment.',
    },
    {
        subject: 'We’re Here to Make Car Care Simple',
        body: 'Hey! Between work, errands, and life, car care can feel like just another chore. Let us take it off your hands. Book here: http://nicitaa.com/appointment.',
    },
    {
        subject: 'Clean Car, Clear Mind',
        body: 'Hi! A clean car can make a surprising difference to your day-to-day life. Let us help you keep your car spotless: http://nicitaa.com/appointment.',
    },
    {
        subject: 'A Small Step for Your Car, a Big Step for You',
        body: 'Hey there! Taking care of your car doesn’t have to be a hassle. With our detailing services, you get to enjoy a car that feels fresh and clean without lifting a finger. Want to give it a try? Book here: http://nicitaa.com/appointment.',
    },
    {
        subject: 'Your Car Will Thank You for This',
        body: 'Hi there! A good detailing session isn’t just a treat for your car—it’s a gift to yourself. Let’s make it happen: http://nicitaa.com/appointment.',
    },
    {
        subject: 'Reclaim Your Car’s Beauty',
        body: 'Hello! Your car’s beauty isn’t lost—it’s just hidden beneath the surface. Let us bring it back with a professional detailing session. Book today: http://nicitaa.com/appointment.',
    },
    {
        subject: 'Life’s Too Short for a Dirty Car',
        body: 'Hey! Don’t spend another day driving a car that doesn’t make you smile. Let’s bring back the joy of a clean car: http://nicitaa.com/appointment.',
    },
    {
        subject: 'The Easiest Way to Refresh Your Car',
        body: 'Hi there! If you’re looking for a quick, hassle-free way to give your car a makeover, we’ve got you covered. Book your detailing session here: http://nicitaa.com/appointment.',
    },
    {
        subject: 'A Cleaner Ride Awaits',
        body: 'Hello! It’s amazing what a good detailing session can do for your car. Let us show you the difference: http://nicitaa.com/appointment.',
    },
    {
        subject: 'What’s Your Car Care Goal?',
        body: 'Hi! Whether it’s restoring shine, protecting your paint, or just keeping things clean, we’re here to help. Let’s get started: http://nicitaa.com/appointment.',
    },
    {
        subject: 'Stop Settling for a Dirty Car',
        body: 'Hey! You don’t have to live with dirt and grime. Let us help you fall in love with your car again. Book here: http://nicitaa.com/appointment.',
    },
    {
        subject: 'A Clean Car is a Happy Car',
        body: 'Hi! Give your car the care it deserves with a professional detailing session. You’ll love the results—guaranteed. Book now: http://nicitaa.com/appointment.',
    },
    {
        subject: 'Let’s Make Your Car Shine Again',
        body: 'Hello! It’s time to bring back your car’s shine and sparkle. Let’s get you scheduled: http://nicitaa.com/appointment.',
    },
    {
        subject: 'Your Solution to Car Care Hassles',
        body: 'Hi there! Say goodbye to the stress of maintaining a clean car. We’ve got you covered. Book your session here: http://nicitaa.com/appointment.',
    },
    {
        subject: 'An Offer Your Car Will Love',
        body: 'Hey! Treat your car to a detailing session that’ll make it look and feel brand new. Start here: http://nicitaa.com/appointment.',
    },
    {
        subject: 'The Best Thing You Can Do for Your Car',
        body: 'Hi! A single detailing session can make a world of difference for your car. Ready to see the results? Book now: http://nicitaa.com/appointment.',
    },
    // with new lines
    {
        subject: 'Quick thing for your business',
        body: `Hi

        We help auto detailing businesses get more clients without spending hours on marketing.

        Wanna call?
        http://nicitaa.com/appointment`,
    },
    {
        subject: 'Thing for auto detailers',
        body: `Hi

        Struggling to fill your schedule? We connect you with car owners who need detailing.

        Wanna call?
        http://nicitaa.com/appointment`,
    },
    {
        subject: 'Quick idea for you',
        body: `Hi

        We help auto detailers book more clients consistently.

        Wanna call?
        http://nicitaa.com/appointment`,
    },
    {
        subject: 'For detailing business owners',
        body: `Hi

        Our strategies bring you more customers without wasting money on ads.

        Wanna call?
        http://nicitaa.com/appointment`,
    },
    {
        subject: 'Quick help for your shop',
        body: `Hi

        We specialize in helping auto detailers grow their businesses.

        Wanna call?
        http://nicitaa.com/appointment`,
    },
    {
        subject: 'Simple way to grow clients',
        body: `Hi

        Let us help you get consistent bookings for your detailing services.

        Wanna call?
        http://nicitaa.com/appointment`,
    },
    {
        subject: 'Quick win for your business',
        body: `Hi

        We help auto detailers get fully booked without headaches.

        Wanna call?
        http://nicitaa.com/appointment`,
    },
    {
        subject: 'More clients, less hassle',
        body: `Hi

        We connect auto detailers with car owners who need your services.

        Wanna call?
        http://nicitaa.com/appointment`,
    },
    {
        subject: 'Need more car owners booking in?',
        body: `Hi

        We bring you more customers without the stress of running ads.

        Wanna call?
        http://nicitaa.com/appointment`,
    },
    {
        subject: 'Quick tip for your business',
        body: `Hi

        Our system helps auto detailers fill their calendars effortlessly.

        Wanna call?
        http://nicitaa.com/appointment`,
    },
    {
        subject: 'How to get more clients',
        body: `Hi

        We help auto detailing businesses grow by connecting with car owners.

        Wanna call?
        http://nicitaa.com/appointment`,
    },
    {
        subject: 'Want more bookings?',
        body: `Hi

        We help auto detailers like you get fully booked.

        Wanna call?
        http://nicitaa.com/appointment`,
    },
    {
        subject: 'Simple way to get more clients',
        body: `Hi

        We specialize in helping auto detailers fill their schedules.

        Wanna call?
        http://nicitaa.com/appointment`,
    },
    {
        subject: 'Quick way to grow your business',
        body: `Hi

        We bring consistent bookings to auto detailing businesses.

        Wanna call?
        http://nicitaa.com/appointment`,
    },
    {
        subject: 'A quick thing for you',
        body: `Hi

        We help auto detailers grow their client base easily.

        Wanna call?
        http://nicitaa.com/appointment`,
    },
    {
        subject: 'Looking to book more ceramic coating jobs?',
        body: `
        Hey!

        I was thinking about helping you get more ceramic coating jobs. If you’re interested, check this out: nicitaa.com/appointment. 

        Let’s catch up soon!
        `,
    },
    {
        subject: 'Have you tried boosting your ceramic coating jobs?',
        body: `
        Hi there!

        I remember you mentioning wanting more ceramic coating jobs. I found a link that could be helpful: nicitaa.com/appointment. 

        Talk soon!
        `,
    },
    {
        subject: 'Great tips for ceramic coating jobs!',
        body: `
        Hey!

        Just wanted to share some advice I found that could help you secure more ceramic coating jobs: nicitaa.com/appointment. 

        Let me know how it goes!
        `,
    },
    {
        subject: 'Need more clients for ceramic coatings?',
        body: `
        Hi!

        I was thinking about how you could bring in more ceramic coating clients. Check this out: nicitaa.com/appointment to see if it can help.

        Let’s chat later!
        `,
    },
    {
        subject: 'Boost your ceramic coating business!',
        body: `
        Hey!

        If you're looking for ways to boost your ceramic coating business, I found this resource: nicitaa.com/appointment. Give it a look!

        Catch up soon!
        `,
    },
    {
        subject: 'Want to increase your ceramic coating jobs?',
        body: `
        Hi!

        I know you’ve been working hard to get more ceramic coating jobs. I found a link that might give you some fresh ideas: nicitaa.com/appointment.

        Let me know your thoughts!
        `,
    },
    {
        subject: 'Ceramic coating job strategies!',
        body: `
        Hey there,

        Just wanted to pass along some strategies for increasing ceramic coating jobs. You might find this useful: nicitaa.com/appointment.

        Talk soon!
        `,
    },
    {
        subject: 'Check this out for ceramic job leads!',
        body: `
        Hi!

        I found something that could help you get more leads for ceramic coating jobs: nicitaa.com/appointment. It could be worth checking out!

        Let’s catch up soon!
        `,
    },
    {
        subject: 'More ceramic coating opportunities!',
        body: `
        Hey!

        If you're interested, I found a site that could help you uncover more ceramic coating opportunities: nicitaa.com/appointment. 

        Let me know if it helps!
        `,
    },
    {
        subject: 'Tips for landing ceramic coating jobs!',
        body: `
        Hi!

        I remember you mentioning your goal for ceramic coating jobs. Here’s a link that might offer some tips: nicitaa.com/appointment.

        Let’s talk more soon!
        `,
    },
    {
        subject: 'Want to expand your ceramic coating client base?',
        body: `
        Hey,

        If you’re looking to expand your client base for ceramic coatings, I found this site that might be useful: nicitaa.com/appointment. 

        Hope this helps!
        `,
    },
    {
        subject: 'More leads for ceramic coatings?',
        body: `
        Hi!

        Just a quick note - if you want more leads for your ceramic coating jobs, check out nicitaa.com/appointment. It could lead to some good opportunities!

        Let me know what you think!
        `,
    },
    {
        subject: 'Unlock ceramic coating job potential!',
        body: `
        Hey!

        I came across something that could really help unlock more ceramic coating job potential: nicitaa.com/appointment. 

        Can’t wait to hear your thoughts!
        `,
    },
    {
        subject: 'New ceramic coating tactics!',
        body: `
        Hi!

        Have you considered trying out new tactics for getting ceramic coating jobs? I found this great link: nicitaa.com/appointment. 

        Let’s catch up soon!
        `,
    },
    {
        subject: 'Tips for better ceramic coating sales!',
        body: `
        Hey!

        I found some tips that could help you with sales for ceramic coating jobs: nicitaa.com/appointment. Chek it out!

        Hope to hear from you!
        `,
    },
    {
        subject: 'Grow your ceramic coating business!',
        body: `
        Hi there!

        I know you’re passionate about ceramic coatings. I found this resource that could help you grow your business: nicitaa.com/appointment.

        Let’s connect later!
        `,
    },
    {
        subject: 'Quick resource for ceramic coatings!',
        body: `
        Hey!

        Just a quick share – if you’re looking for an easy resource to help with ceramic coating jobs, here you go: nicitaa.com/appointment.

        Chat soon!
        `,
    },
    {
        subject: 'Explore ceramic coating possibilities!',
        body: `
        Hi!

        Have you explored all the possibilities for ceramic coating jobs? This might help: nicitaa.com/appointment. 

        Talk to you soon!
        `,
    },
    {
        subject: 'Unlock the potential of ceramic coatings!',
        body: `
        Hey!

        I found a way to unlock the potential for more ceramic coatings. Check this: nicitaa.com/appointment. 

        Can’t wait to hear what you think!
        `,
    },
    {
        subject: 'More ceramic coating jobs? Seriously?',
        body: `
        Hey [NAME],

        I know I should insert your name here, but would you consider deleting this email if I told you that I could help you get more ceramic coating jobs? 

        Seriously, wouldn’t it be worth a quick chat? Check this: nicitaa.com/appointment.

        Catch you later!
        `,
    },
    {
        subject: 'Job offers on the table!',
        body: `
        Hey [NAME],

        I know I should insert your name here, but what if I said you could delete this email if I promised to help you land more ceramic coating jobs? 

        Tempted to chat? Here’s the link: nicitaa.com/appointment.

        Let me know!
        `,
    },
    {
        subject: 'Ceramic coating jobs? Yawn. Or not?',
        body: `
        Hey [NAME],

        I know I should insert your name here, but would you roll your eyes and delete this email if I said I could get you more ceramic coating jobs? 

        What if we had a chat instead? Here’s the link: nicitaa.com/appointment.

        Talk soon?
        `,
    },
    {
        subject: 'Another email about jobs? Maybe not.',
        body: `
        Hey [NAME],

        I know I should insert your name here, but if I told you I could help you score more ceramic coating jobs, would you consider just deleting this email? 

        Or how about we chat about it? Check it out: nicitaa.com/appointment.

        Cheers!
        `,
    },
    {
        subject: 'Is this email worth your time?',
        body: `
        Hey [NAME],

        I know I should insert your name here, but would this email go straight to the trash if I said I could offer you more ceramic coating jobs? 

        Maybe a chat would be better? Here’s the link: nicitaa.com/appointment.

        Let’s see!
        `,
    },
    {
        subject: 'Ceramic coating jobs – ready to delete?',
        body: `
        Hey [NAME],

        I know I should insert your name here, but would you eagerly hit delete if I said I’d help you find more ceramic coating jobs? 

        How about a chat instead? Here’s a link: nicitaa.com/appointment.

        Let me know!
        `,
    },
    {
        subject: 'More jobs? Really, who cares?',
        body: `
        Hey [NAME],

        I know I should insert your name here, but if I told you that I could help land you more ceramic coating jobs, would you just delete this message? 

        Or maybe you’d prefer to chat? Here’s the link: nicitaa.com/appointment.

        What do you think?
        `,
    },
    {
        subject: "Job offers that won't flood your inbox!",
        body: `
        Hey [NAME],

        I know I should insert your name here, but would this email get tossed if I said I’d help you get more ceramic coating jobs without spamming you? 

        Or could we chat about it? Here’s the link: nicitaa.com/appointment.

        Talk soon?
        `,
    },
    {
        subject: 'Are you ignoring your inbox or me?',
        body: `
        Hey [NAME],

        I know I should insert your name here, but would you ignore this email if I claimed I could help you boost your ceramic coating jobs? 

        Maybe a chat would be better? Check it out: nicitaa.com/appointment.

        Let’s talk!
        `,
    },
    {
        subject: 'Ceramic coating jobs – yes or no?',
        body: `
        Hey [NAME],

        I know I should insert your name here, but would you hit delete if I told you I’m here to help you snag more ceramic coating jobs? 

        Maybe we should chat instead? Here’s the link: nicitaa.com/appointment.

        What do you say?
        `,
    },
    {
        subject: "More work? Who wouldn't want that?",
        body: `
        Hey [NAME],

        I know I should insert your name here, but if I told you I could help you get more ceramic coating jobs, would you just toss this email? 

        Or could we chat about it? Here’s the link: nicitaa.com/appointment.

        Let me know!
        `,
    },
    {
        subject: 'Exciting ceramic coating job opportunity? Yawn!',
        body: `
        Hey [NAME],

        I know I should insert your name here, but would you roll your eyes and delete this email if I mentioned I could help you with ceramic coating jobs? 

        Or let’s chat first? Check this: nicitaa.com/appointment.

        Talk later?
        `,
    },
    {
        subject: 'More ceramic coating jobs? Oh, what a surprise!',
        body: `
        Hey [NAME],

        I know I should insert your name here, but if I were to claim I have the magic key to more ceramic coating jobs, would you delete me instantly? 

        Or do you want to chat? Here’s a link: nicitaa.com/appointment.

        Looking forward to it!
        `,
    },
    {
        subject: 'Potential jobs – or just spam?',
        body: `
        Hey [NAME],

        I know I should insert your name here, but would you mark this as spam if I promised more ceramic coating jobs? 

        Or maybe it's worth chatting? Check it out: nicitaa.com/appointment.

        Talk soon?
        `,
    },
    {
        subject: 'quick thing for owner',
        body: `
        Hey [NAME],

        We want to help you get 10 ceramic coating appointments on a 0 risk basis. 

        You open to talk it?

        Book a quick 5-10 minute call instead of this "email-ping pong": http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'question for you',
        body: `
        Hey [NAME],

        We want to help you secure 10 ceramic coating appointments at zero risk to you. 

        You open to chat about it?

        Let’s skip the back-and-forth and book a quick 5-10 minute call: http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'did you know...',
        body: `
        Hey [NAME],

        We want to assist you in getting 10 ceramic coating appointments with no risk involved. 

        You open to discuss?

        Let’s make it easy—book a quick 5-10 minute call: http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'open to chat about it?',
        body: `
        Hey [NAME],

        We want to help you score 10 ceramic coating appointments on a zero risk basis. 

        You open to have a chat about it?

        Skip the email ping pong and book a quick 5-10 minute call: http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'quick question for you',
        body: `
        Hey [NAME],

        We want to help you land 10 ceramic coating appointments at no risk to you. 

        You open to discuss this?

        Let’s skip the emails and book a quick 5-10 minute call: http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'just checking in...',
        body: `
        Hey [NAME],

        We want to help you obtain 10 ceramic coating appointments with zero risk! 

        You open to chat about it?

        Book a quick 5-10 minute call instead of email ping pong: http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'zero risk opportunity',
        body: `
        Hey [NAME],

        We want to assist you in scoring 10 ceramic coating appointments on a 0 risk basis. 

        You open to discuss?

        Let’s make it easy—book a quick 5-10 minute call: http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'did you hear about this?',
        body: `
        Hey [NAME],

        We want to help you secure 10 ceramic coating appointments risk-free. 

        You open to chat about it?

        Skip the back-and-forth emails and book a quick 5-10 minute call: http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'curious about this?',
        body: `
        Hey [NAME],

        We want to help you get 10 ceramic coating appointments on a 0 risk basis. 

        You open to talk?

        Book a quick 5-10 minute call instead of this "email-ping pong": http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'quick chat about something?',
        body: `
        Hey [NAME],

        We want to help you land 10 ceramic coating appointments at no risk to you. 

        You open to chat?

        Let’s skip the emails and book a quick 5-10 minute call: http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'quick thing for owner',
        body: `
        We want to help you get 10 ceramic coating appointments on a 0 risk basis. 

        You open to talk about it?

        Book a quick 5-10 minute call instead of this "email-ping pong": http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'question for you',
        body: `
        We want to assist you in securing 10 ceramic coating appointments at zero risk to you. 

        Interested in a quick chat?

        Let’s skip the back-and-forth and book a quick 5-10 minute call: http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'did you know...',
        body: `
        You can get 10 ceramic coating appointments without any risk involved. 

        Open to discuss?

        Let’s make it easy—book a quick 5-10 minute call: http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'open to chat about it?',
        body: `
        There’s an opportunity to score 10 ceramic coating appointments at zero risk.

        Want to chat about it?

        Skip the email ping pong and book a quick 5-10 minute call: http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'quick question for you',
        body: `
        Have you thought about landing 10 ceramic coating appointments with no risk?

        Open to discuss?

        Let’s skip the emails and book a quick 5-10 minute call: http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'just checking in...',
        body: `
        There’s a way to obtain 10 ceramic coating appointments with zero risk!

        Want to chat?

        Book a quick 5-10 minute call instead of the usual email exchange: http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'zero risk opportunity',
        body: `
        We can help you secure 10 ceramic coating appointments on a 0 risk basis.

        Interested in a quick call?

        Let’s make it easy—book a 5-10 minute call: http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'did you hear about this?',
        body: `
        You can score 10 ceramic coating appointments risk-free.

        Open to chat about it?

        Skip the back-and-forth emails and book a quick 5-10 minute call: http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'curious about this?',
        body: `
        There’s a chance to get 10 ceramic coating appointments with zero risk!

        Want to discuss?

        Book a quick 5-10 minute call instead of this "email ping pong": http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'quick chat about something?',
        body: `
        Have you thought about landing 10 ceramic coating appointments at no risk?

        Open to discuss?

        Let’s skip the emails and book a quick 5-10 minute call: http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'thinking about growth?',
        body: `
        We can help you get 10 ceramic coating appointments without any risk.

        Interested in chatting?

        Let’s make it simple—book a quick 5-10 minute call: http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'new opportunity for you',
        body: `
        There’s a chance to secure 10 ceramic coating appointments with zero risk.

        Want to discuss?

        Instead of emailing, let’s talk for 5-10 minutes: http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'let’s talk business',
        body: `
        We can help you land 10 ceramic coating appointments risk-free.

        Open to a brief chat?

        Skip the email chain and book a 5-10 minute call: http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'exciting news for you',
        body: `
        Have you heard about getting 10 ceramic coating appointments at no risk?

        Interested in more info?

        Let’s chat for a few minutes—book a quick call: http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'quick discussion?',
        body: `
        You can get 10 ceramic coating appointments without taking on any risk!

        Open to talk about it?

        Let’s skip the back-and-forth and schedule a 5-10 minute call: http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'let’s connect',
        body: `
        There’s a great opportunity for you to secure 10 ceramic coating appointments.

        Interested in discussing?

        Let’s make it easy—book a 5-10 minute call: http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'question about appointments',
        body: `
        We want to help you earn 10 ceramic coating appointments, all on a zero risk basis.

        Interested in a quick chat?

        Skip the emails and book a brief call: http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'time to grow!',
        body: `
        There’s a chance to get 10 ceramic coating appointments without any risk involved.

        Want to chat about it?

        Book a quick 5-10 minute call instead of this "email ping pong": http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'your next steps',
        body: `
        We can assist you in securing 10 ceramic coating appointments risk-free.

        Open to discuss?

        Let’s make this efficient—book a quick call: http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'potential partnership',
        body: `
        Are you interested in landing 10 ceramic coating appointments at no risk?

        Open to a brief discussion?

        Skip the emails and let’s talk for 5-10 minutes: http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'quick thing for owner',
        body: `
        We want to help you get 10 ceramic coating appointments on a 0 risk basis. 

        Would you be opposed to discussing it over a quick google-meet call?

        You can schedule a 5-10 minute chat here: http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'question for you',
        body: `
        We want to assist you in securing 10 ceramic coating appointments at zero risk to you. 

        Would you be opposed to discussing this over a quick google-meet call?

        Let’s make it simple and book a quick 5-10 minute chat: http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'did you know...',
        body: `
        You can get 10 ceramic coating appointments without any risk involved. 

        Would you be opposed to discussing it over a quick google-meet call?

        Just book a 5-10 minute slot here: http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'open to chat about it?',
        body: `
        There’s an opportunity to score 10 ceramic coating appointments at zero risk.

        Would you be opposed to discussing it over a quick google-meet call?

        Schedule a brief 5-10 minute conversation here: http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'quick question for you',
        body: `
        Have you thought about landing 10 ceramic coating appointments with no risk?

        Would you be opposed to discussing it over a quick google-meet call?

        Let’s finalize the details in a 5-10 minute chat: http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'just checking in...',
        body: `
        There’s a way to obtain 10 ceramic coating appointments with zero risk!

        Would you be opposed to discussing it over a quick google-meet call?

        Let’s make it easy and book a 5-10 minute call: http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'zero risk opportunity',
        body: `
        We can help you secure 10 ceramic coating appointments on a 0 risk basis.

        Would you be opposed to discussing it over a quick google-meet call?

        You can schedule a brief 5-10 minute chat here: http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'did you hear about this?',
        body: `
        You can score 10 ceramic coating appointments risk-free.

        Would you be opposed to discussing this over a quick google-meet call?

        Let’s talk for 5-10 minutes—here’s a link to book: http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'curious about this?',
        body: `
        There’s a chance to get 10 ceramic coating appointments with zero risk!

        Would you be opposed to discussing it over a quick google-meet call?

        Schedule a short 5-10 minute chat here: http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'quick chat about something?',
        body: `
        Have you thought about landing 10 ceramic coating appointments at no risk?

        Would you be opposed to discussing it over a quick google-meet call?

        Let’s make it efficient and book a quick 5-10 minute meeting: http://nicitaa.com/appointment
        `,
    },
    {
        subject: 'explore a game-changer for your business',
        body: `
        Hi there,
    
        Have you ever considered boosting your business with 10 hassle-free ceramic coating appointments? 
    
        I'd love to share some exciting insights with you. How about we jump on a brief Google Meet session to discuss this opportunity? 
    
        Let's keep it short and productive—just 5-10 minutes should do the trick! You can schedule our meeting here: http://nicitaa.com/appointment
    
        Looking forward to chatting!
        `,
    },
    {
        subject: 'unlock your business potential',
        body: `
        Hello!
    
        Are you ready to elevate your business with 10 guaranteed ceramic coating appointments? 
    
        I’d love to brainstorm some ideas with you! Would you be open to a quick 5-10 minute Google Meet discussion? 
    
        You can pick a time that works for you here: http://nicitaa.com/appointment
    
        Excited to connect!
        `,
    },
    {
        subject: 'let’s chat about a unique opportunity',
        body: `
        Hi there,
    
        Have you ever thought about filling your schedule with 10 easy ceramic coating appointments? 
    
        If you're interested, I’d love to chat about it in a fast-paced Google Meet session. Just 5-10 minutes of your time!
    
        Schedule our chat here: http://nicitaa.com/appointment
    
        Looking forward to hearing from you!
        `,
    },
    {
        subject: 'quick opportunity to boost your appointments!',
        body: `
        Greetings!
    
        What if you could secure 10 ceramic coating appointments with no risk involved? 
    
        I’d like to explore this possibility with you over a quick Google Meet call. How does a 5-10 minute meeting sound?
    
        Choose your slot here: http://nicitaa.com/appointment
    
        Can’t wait to talk!
        `,
    },
    {
        subject: 'a quick chat that might interest you',
        body: `
        Hi!
    
        Ever considered landing 10 risk-free ceramic coating appointments? 
    
        I’d love to go over some details with you! Are you available for a brief 5-10 minute chat on Google Meet? 
    
        You can book your favorite time here: http://nicitaa.com/appointment
    
        Looking forward to our conversation!
        `,
    },
    {
        subject: 'let’s maximize your business potential',
        body: `
        Hi there,
    
        Imagine securing 10 easy ceramic coating appointments without any hassle. Sounds intriguing, right? 
    
        I’d love to share some insights with you! Can we hop on a quick 5-10 minute Google Meet call? 
    
        Simply pick a time that works best for you here: http://nicitaa.com/appointment
    
        Excited to connect and explore possibilities!
        `,
    },
    {
        subject: 'an opportunity worth discussing',
        body: `
        Hello!
    
        What if you could fill your calendar with 10 guaranteed ceramic coating appointments? 
    
        I’d like to discuss how we can make that happen. Would you be open to a brief discussion over Google Meet? Just 5-10 minutes should suffice! 
    
        Schedule your appointment here: http://nicitaa.com/appointment
    
        Looking forward to chatting!
        `,
    },
    {
        subject: 'quick discussion on boosting your appointments',
        body: `
        Hi there,
    
        Are you ready to take your business to the next level by securing 10 hassle-free ceramic coating appointments? 
    
        Let’s discuss this opportunity in a quick 5-10 minute Google Meet. 
    
        You can select a convenient time here: http://nicitaa.com/appointment
    
        Can’t wait to connect!
        `,
    },
    {
        subject: 'your next step towards growth',
        body: `
        Greetings!
    
        What if I told you that you could easily schedule 10 ceramic coating appointments? 
    
        I’d love to share some strategies in a quick Google Meet session—just 5-10 minutes of your time! 
    
        Choose your preferred slot here: http://nicitaa.com/appointment
    
        Looking forward to our discussion!
        `,
    },
    {
        subject: 'discover a simple way to grow your appointments',
        body: `
        Hello!
    
        Ever thought about how 10 easy ceramic coating appointments could transform your business? 
    
        I’d love to talk about this in a short Google Meet call. Let’s set aside just 5-10 minutes! 
    
        Schedule your meeting here: http://nicitaa.com/appointment
    
        Excited to hear from you!
        `,
    },
    {
        subject: 'unlock a simple solution to fill your schedule',
        body: `
        Hi there,
    
        Have you considered the benefits of securing 10 hassle-free ceramic coating appointments? 
    
        I'd like to explore this opportunity with you! Can we hop on a quick 5-10 minute Google Meet call? 
    
        You can easily schedule a time here: http://nicitaa.com/appointment
    
        Can't wait to share more!
        `,
    },
    {
        subject: 'discover how easy it is to grow your appointments',
        body: `
        Greetings!
    
        What if you could simply schedule 10 ceramic coating appointments without any hassle? 
    
        I'd love to share some insights on how to make this happen! How about a quick Google Meet call to discuss? Just 5-10 minutes. 
    
        Simply book your time here: http://nicitaa.com/appointment
    
        Can't wait to explore this opportunity further!
        `,
    },
    {
        subject: 'a simple way to boost your schedule',
        body: `
        Hi there,
    
        Are you ready to take your business to the next level by securing 10 easy ceramic coating appointments? 
    
        I'd love to discuss this opportunity further with you! Can we chat on a quick Google Meet call? 
    
        Simply choose your time here: http://nicitaa.com/appointment
    
        Can't wait to connect!
        `,
    },
    {
        subject: 'discover a hassle-free opportunity to grow',
        body: `
        Greetings!
    
        What if you could fill your calendar with 10 hassle-free ceramic coating appointments? 
    
        I'd love to share more about this opportunity! Can we hop on a quick Google Meet call to discuss? Just 5-10 minutes should suffice! 
    
        Schedule your time here: http://nicitaa.com/appointment
    
        Can't wait to hear back from you!
        `,
    },
    {
        subject: 'secure your spot for a hassle-free growth opportunity',
        body: `
        Hi there,
    
        Ever thought about how securing 10 easy ceramic coating appointments could benefit your business? 
    
        I'd like to discuss this opportunity with you in more detail! Can we chat on a quick Google Meet call? 
    
        Simply book your time here: http://nicitaa.com/appointment
    
        Can't wait to share more!
        `,
    },
    {
        subject: 'unlock a simple path to growing your appointments',
        body: `
        Greetings!
    
        What if you could discover a simple way to fill your schedule with 10 ceramic coating appointments? 
    
        I'd love to share more about this opportunity! How about a quick Google Meet call to discuss? 
    
        You can easily schedule a time here: http://nicitaa.com/appointment
    
        Can't wait to explore this further!
        `,
    },
    {
        subject: 'unlock the true potential of your ceramic coating business!',
        body: `
        Hi,

        I hope this message finds you well! I wanted to reach out because I've been following your work in the ceramic coating industry, and I believe there's an exciting opportunity for us to collaborate.

        Are you open to a quick conversation about innovative strategies that can elevate your services and attract more clients? If so, let's schedule a time that works for you: http://nicitaa.com/appointment.

        Looking forward to connecting!
        `,
    },
    {
        subject: 'are your ceramic coating sales stalling?',
        body: `
        Hi,

        Are you feeling like your ceramic coating jobs could use a boost? I understand how challenging it can be to stand out in this competitive market.

        I’d love to share some effective techniques that can help you drive more customers to your business. How about we connect for a brief chat? You can book a time here: http://nicitaa.com/appointment.

        Excited to hear from you!
        `,
    },
    {
        subject: 'let`s revitalize your ceramic coating business!',
        body: `
        Hello,

        Just a quick note to check in. If boosting your ceramic coating business is on your mind, let’s chat! 

        I've got some unique insights that could help increase your customer engagement and streamline your operations. Schedule a quick call with me here: http://nicitaa.com/appointment.

        Hope to talk soon!
        `,
    },
    {
        subject: 'hey [NAME] lets boost your auto detailing biz',
        body: `yoo [NAME] I got you. No upfront cost - just pure results. I'll handle leads, qualify them, and book quotes for 10% commission. 

				Let’s scale. When do we start? 

				[MEME-URL] 

				reply with 👍 if you're interested`
    },
    {
        subject: '[NAME] your auto detailing business needs this',
        body: `Hey [NAME], 

		Imagine your phone blowing up with quality leads while you focus on perfecting those details. I can make it happen. 

		Check out how: [LINK] 

		[MEME-URL] 

		Let me know what you think!`
    },
    {
        subject: 'no more empty slots [NAME]',
        body: `[NAME], tired of slow days? Let’s fill your calendar with paying customers. 

		I handle inquiries, you handle the cars. 10% per booked quote. 

		Sound good? [LINK] 

		[MEME-URL] 

		reply with 👍 if interested`
    },
    {
        subject: '[NAME] lets talk auto detailing growth',
        body: `Hey [NAME], 

		[COMPANY_NAME] could be booking 2x more appointments next month. Want to know how? 

		No fancy systems - just real leads. 

		[MEME-URL] 

		Let’s chat: [LINK]`
    },
    {
        subject: 'your competition is doing this [NAME]',
        body: `[NAME], other detailers are scaling with our lead system. Don’t get left behind. 

		Zero cost until we book clients for you. 

		[MEME-URL] 

		Interested? [LINK]`
    },
    {
        subject: 'wanna stop chasing clients [NAME]',
        body: `Yo [NAME], 

		What if clients came to you instead? 

		Our system books high-quality appointments so you can focus on detailing. 

		10% per booked quote. 

		[MEME-URL] 

		reply with 👍 if you want in`
    },
    {
        subject: '[NAME] your detailing biz is missing this',
        body: `Hey [NAME], 

		Your work is awesome - but are you getting enough eyes on it? 

		Let’s fix that. I qualify leads and book appointments so you don’t have to. 

		[MEME-URL] 

		Learn more: [LINK]`
    },
    {
        subject: 'the secret to consistent detailing clients',
        body: `[NAME], the top detailers use this simple system: 

		1. We handle inquiries 
		2. You get booked 
		3. Pay only for results (10%) 

		[MEME-URL] 

		Want consistent work? [LINK]`
    },
    {
        subject: '[NAME] your phone should be ringing',
        body: `[NAME], with the right system, you could be turning away business. 

		Let me show you how we fill calendars for top detailers. 

		Pay only when we deliver. 

		[MEME-URL] 

		Details here: [LINK]`
    },
    {
        subject: 'more clients without ads [NAME]',
        body: `Hey [NAME], 

		Ads are expensive. We get you clients through smarter methods. 

		No upfront fees - just 10% per booked detail. 

		[MEME-URL] 

		Interested? Let me know`
    },
    {
        subject: '[NAME] your next 10 clients are waiting',
        body: `[NAME], we have people ready to book detailing services right now. 

		Let me connect them to you. 

		You pay only when they book. 

		[MEME-URL] 

		Get started: [LINK]`
    },
    {
        subject: 'from slow days to fully booked [NAME]',
        body: `[NAME], imagine every week being fully booked. 

		Our system makes it possible. 

		10% per successful booking. 

		[MEME-URL] 

		Want to try? [LINK]`
    },
    {
        subject: 'the lazy way to get detailing clients',
        body: `Hey [NAME], 

		What if clients came to you on autopilot? 

		We make it happen - you just focus on the cars. 

		[MEME-URL] 

		Learn more: [LINK]`
    },
    {
        subject: '[NAME] your detailing skills deserve more clients',
        body: `[NAME], your work is too good to be sitting idle. 

		Let me get you the clients you deserve. 

		No risk - pay per booked appointment. 

		[MEME-URL] 

		reply with 👍 if interested`
    },
    {
        subject: 'why work harder when you can work smarter [NAME]',
        body: `[NAME], 

		Spending hours chasing clients? 

		Our system puts them in your lap. 

		10% per booked detail. 

		[MEME-URL] 

		Want in? [LINK]`
    },
    {
        subject: '[NAME] your ideal clients are looking for you',
        body: `Hey [NAME], 

		People want premium detailing - they just can’t find you. 

		Let’s fix that. I’ll handle inquiries and bookings. 

		[MEME-URL] 

		Interested? Let me know`
    },
    {
        subject: 'the math is simple [NAME]',
        body: `[NAME], 

		More booked appointments = more money. 

		We increase your bookings, you increase your income. 

		Only 10% per successful booking. 

		[MEME-URL] 

		Let’s talk: [LINK]`
    },
    {
        subject: '[NAME] stop leaving money on the table',
        body: `[NAME], every unfilled slot is lost income. 

		Let’s get you booked solid. 

		No upfront cost - pay per result. 

		[MEME-URL] 

		reply with 👍 if you want details`
    },
    {
        subject: 'your detailing business on autopilot [NAME]',
        body: `Hey [NAME], 

		What if your phone rang with ready-to-book clients daily? 

		Our system makes it reality. 

		[MEME-URL] 

		See how: [LINK]`
    },
    {
        subject: '[NAME] lets get you more high-ticket details',
        body: `[NAME], 

		Premium clients pay premium prices. 

		I’ll connect you with them - you blow them away with your work. 

		10% per booked appointment. 

		[MEME-URL] 

		Interested? [LINK]`
    },
    {
        subject: 'why struggle when help is here [NAME]',
        body: `[NAME], 

		Getting clients shouldn’t be the hard part of your business. 

		Let me handle that for you. 

		[MEME-URL] 

		No upfront fees. Just results. 

		Want to chat?`
    },
    {
        subject: '[NAME] your next 5 clients could be booked today',
        body: `Hey [NAME], 

		We have clients ready for ceramic coatings and full details. 

		Let me send them your way. 

		You pay only when they book. 

		[MEME-URL] 

		Interested? [LINK]`
    },
    {
        subject: 'the smart detailers secret [NAME]',
        body: `[NAME], 

		Top detailers focus on their craft while we handle their bookings. 

		Want the same advantage? 

		[MEME-URL] 

		Let’s talk: [LINK]`
    },
    {
        subject: '[NAME] more bookings less hassle',
        body: `[NAME], 

		What if you could: 
		- Stop chasing clients 
		- Fill your calendar 
		- Only pay for results 

		[MEME-URL] 

		We make it possible. 

		reply with 👍 if interested`
    },
    {
        subject: 'your detailing business could be this busy [NAME]',
        body: `Hey [NAME], 

		Imagine turning away work because you’re fully booked. 

		Let’s make it happen. 

		10% per successful booking. 

		[MEME-URL] 

		Details here: [LINK]`
    },
    {
        subject: '[NAME] lets talk steady clients',
        body: `[NAME], 

		Consistency beats occasional home runs. 

		Let’s get you steady, high-quality appointments. 

		[MEME-URL] 

		No upfront cost. Just results. 

		Interested?`
    },
    {
        subject: 'the problem with most detailers [NAME]',
        body: `[NAME], 

		Most detailers are amazing at cars but bad at business. 

		Let me handle your client acquisition while you do what you love. 

		[MEME-URL] 

		Sound good? [LINK]`
    },
    {
        subject: '[NAME] your skills deserve more exposure',
        body: `Hey [NAME], 

		Your detailing work is art. But art needs an audience. 

		Let me bring the right clients to you. 

		10% per booked appointment. 

		[MEME-URL] 

		Want in? [LINK]`
    },
    {
        subject: 'stop the feast-or-famine cycle [NAME]',
        body: `[NAME], 

		Tired of busy weeks followed by empty ones? 

		Our system creates consistent bookings. 

		[MEME-URL] 

		Pay only for results. 

		Interested? Let me know`
    },
    {
        subject: '[NAME] lets optimize your detailing biz',
        body: `[NAME], 

		What if you could: 
		- Work fewer hours 
		- Make more money 
		- Stress less 

		It starts with consistent bookings. 

		[MEME-URL] 

		Let’s chat: [LINK]`
    },
    {
        subject: 'your phone should be your best employee [NAME]',
        body: `Hey [NAME], 

		Right now your phone is probably quiet. 

		Let’s make it your 24/7 booking machine. 

		[MEME-URL] 

		10% per successful appointment. 

		reply with 👍 if interested`
    },
    {
        subject: '[NAME] the luxury detailers secret',
        body: `[NAME], 

		High-end detailers don’t chase clients - clients chase them. 

		Let me get you there. 

		[MEME-URL] 

		No upfront cost. Just results. 

		Want details? [LINK]`
    },
    {
        subject: 'from good to fully booked [NAME]',
        body: `[NAME], 

		You’re good at detailing. Let’s make you great at business. 

		Our booking system fills your calendar. 

		[MEME-URL] 

		10% per appointment. 

		Interested? [LINK]`
    },
    {
        subject: '[NAME] lets talk ceramic coating clients',
        body: `Hey [NAME], 

		Ceramic coating clients pay premium prices. 

		I can connect you with them daily. 

		[MEME-URL] 

		You pay only when they book. 

		Sound good?`
    },
    {
        subject: 'the booking hack top detailers use [NAME]',
        body: `[NAME], 

		There’s a reason some detailers are always busy. 

		Let me share their secret. 

		[MEME-URL] 

		No risk - pay per booked appointment. 

		Want in? [LINK]`
    },
    {
        subject: '[NAME] your business is leaving money on the table',
        body: `[NAME], 

		For every unfilled slot, that’s $XXX lost. 

		Let’s fix that. 

		[MEME-URL] 

		Our system books clients so you don’t have to. 

		Interested? Let me know`
    },
    {
        subject: 'more details less marketing [NAME]',
        body: `Hey [NAME], 

		You became a detailer to work on cars, not to be a marketer. 

		Let me handle the client acquisition. 

		[MEME-URL] 

		10% per booked appointment. 

		reply with 👍 if you want details`
    },
    {
        subject: '[NAME] your ideal client is waiting',
        body: `[NAME], 

		The person who will pay top dollar for your work is looking right now. 

		Let me connect you. 

		[MEME-URL] 

		No upfront cost. Just results. 

		[LINK]`
    },
    {
        subject: 'the simple way to scale [NAME]',
        body: `[NAME], 

		More bookings = more revenue. 

		We increase your bookings, you increase your income. 

		Simple. 

		[MEME-URL] 

		10% per successful booking. 

		Want to start? [LINK]`
    },
    {
        subject: '[NAME] lets talk consistent income',
        body: `Hey [NAME], 

		What if you knew exactly how much you’d make each month? 

		Our booking system makes predictable income possible. 

		[MEME-URL] 

		Interested? Let me know`
    },
    {
        subject: 'your detailing business could be easier [NAME]',
        body: `[NAME], 

		Why stress over bookings when you could have them automated? 

		[MEME-URL] 

		We handle inquiries, you handle the cars. 

		10% per booked appointment. 

		Sound good? [LINK]`
    },
    {
        subject: '[NAME] the booking problem solved',
        body: `[NAME], 

		Getting clients is the hardest part for most detailers. 

		Let me solve that for you. 

		[MEME-URL] 

		No upfront fees. Just results. 

		Want in? [LINK]`
    },
    {
        subject: 'from sporadic to steady [NAME]',
        body: `Hey [NAME], 

		Tired of unpredictable income? 

		Let’s get you steady, high-quality appointments. 

		[MEME-URL] 

		10% per booked detail. 

		reply with 👍 if interested`
    },
    {
        subject: '[NAME] your competition is using this',
        body: `[NAME], 

		The detailers who are always busy? They’re not better - they’re smarter. 

		Let me show you their secret. 

		[MEME-URL] 

		No risk - pay per result. 

		[LINK]`
    },
    {
        subject: 'your phone should be ringing [NAME]',
        body: `[NAME], 

		With the right system, you’d be turning away business. 

		Let’s make it happen. 

		[MEME-URL] 

		10% per successful booking. 

		Interested? Let me know`
    },
    {
        subject: '[NAME] lets maximize your detailing biz',
        body: `Hey [NAME], 

		You’re great at detailing. Let’s make you great at business. 

		Our system fills your calendar. 

		[MEME-URL] 

		Pay only when we deliver. 

		Want details? [LINK]`
    },
    {
        subject: 'the lazy detailers advantage [NAME]',
        body: `[NAME], 

		Work smarter, not harder. 

		Let me handle your bookings while you focus on cars. 

		[MEME-URL] 

		10% per appointment. 

		Sound good? [LINK]`
    },
    {
        subject: '[NAME] your next 10 appointments could be booked',
        body: `[NAME], 

		We have clients ready for detailing services. 

		Let me connect them to you. 

		[MEME-URL] 

		You pay only when they book. 

		Interested? [LINK]`
    },
    {
        subject: 'stop the client chase [NAME]',
        body: `Hey [NAME], 

		What if clients came to you instead? 

		Our system makes it happen. 

		[MEME-URL] 

		No upfront cost. Just results. 

		reply with 👍 if you want in`
    },
    {
        "subject": "quick question on detailing products",
        "body": "Hi $[NAME],\n\nYour detailing work is top-notch. I’m $[OWNER_NAME], in the auto detailing space, and noticed your skill. Have insights on new products that might help.\n\nFree for a 5-min chat? No sales, just networking.\n\n$[LINK]\n\nReply with 👍 if interested.\n\nP.S. Fun meme: $[MEME-URL]"
    },
    {
        "subject": "quick question on polishing tips",
        "body": "Hi $[NAME],\n\nLove your vehicle transformations. I’m $[OWNER_NAME], auto detailing veteran. Got some polishing tips to share.\n\nGot 5 mins to talk? No pitch, just value.\n\n$[LINK]\n\nReply with 👍 if interested.\n\nP.S. Check this meme: $[MEME-URL]"
    },
    {
        "subject": "quick question on client retention",
        "body": "Hi $[NAME],\n\nYour customer reviews are stellar. I’m $[OWNER_NAME], in detailing, with ideas on client retention.\n\nUp for a 5-min chat? No selling, just ideas.\n\n$[LINK]\n\nReply with 👍 if interested.\n\nP.S. Meme alert: $[MEME-URL]"
    },
    {
        "subject": "quick question on workflow hacks",
        "body": "Hi $[NAME],\n\nYour detailing efficiency stands out. I’m $[OWNER_NAME], auto detailing pro, with workflow hacks to share.\n\nFree for a 5-min call? No sales, pure networking.\n\n$[LINK]\n\nReply with 👍 if interested.\n\nP.S. Funny meme: $[MEME-URL]"
    },
    {
        "subject": "quick question on ceramic coatings",
        "body": "Hi $[NAME],\n\nYour coating work is impressive. I’m $[OWNER_NAME], in detailing, with thoughts on ceramic products.\n\nGot 5 mins to connect? No pitch, just value.\n\n$[LINK]\n\nReply with 👍 if interested.\n\nP.S. Meme for you: $[MEME-URL]"
    },
    {
        "subject": "quick question on detailing trends",
        "body": "Hi $[NAME],\n\nYour work stays ahead of trends. I’m $[OWNER_NAME], detailing enthusiast, with insights on new techniques.\n\nUp for a 5-min chat? No selling, just ideas.\n\n$[LINK]\n\nReply with 👍 if interested.\n\nP.S. Fun meme: $[MEME-URL]"
    },
    {
        "subject": "quick question on product suppliers",
        "body": "Hi $[NAME],\n\nYour detailing quality is superb. I’m $[OWNER_NAME], in auto detailing, with supplier tips.\n\nFree for a 5-min call? No sales, just networking.\n\n$[LINK]\n\nReply with 👍 if interested.\n\nP.S. Check this meme: $[MEME-URL]"
    },
    {
        "subject": "quick question on interior cleaning",
        "body": "Hi $[NAME],\n\nYour interior detailing is flawless. I’m $[OWNER_NAME], detailing pro, with cleaning tips.\n\nGot 5 mins to talk? No pitch, pure value.\n\n$[LINK]\n\nReply with 👍 if interested.\n\nP.S. Meme time: $[MEME-URL]"
    },
    {
        "subject": "quick question on pricing strategies",
        "body": "Hi $[NAME],\n\nYour service quality shines. I’m $[OWNER_NAME], in detailing, with pricing ideas.\n\nUp for a 5-min chat? No selling, just insights.\n\n$[LINK]\n\nReply with 👍 if interested.\n\nP.S. Funny meme: $[MEME-URL]"
    },
    {
        "subject": "quick question on detailing tools",
        "body": "Hi $[NAME],\n\nYour tool use is impressive. I’m $[OWNER_NAME], detailing veteran. Got tool insights to share.\n\nFree for a 5-min call? No sales, just value.\n\nPlease reply with 👍 if interested.\n\nP.S. Meme alert: $[MEME-URL]"
    },
    {
        "subject": "quick question on customer reviews",
        "body": "Hi $[NAME],\n\nYour reviews are outstanding. I’m $[OWNER_NAME], in auto detailing, with review-boosting tips.\n\nGot 5 mins to connect? No pitch, just ideas.\n\n$[LINK]\n\nReply with 👍 if interested.\n\nP.S. Fun meme: $[MEME-URL]"
    },
    {
        "subject": "quick question on waxing techniques",
        "body": "Hi $[NAME],\n\nYour waxing results are stunning. I’m $[OWNER_NAME], detailing pro, with technique ideas.\n\nUp for a 5-min chat? No selling, just networking.\n\n$[LINK]\n\nReply with 👍 if interested.\n\nP.S. Meme for you: $[MEME-URL]"
    },
    {
        "subject": "quick question on time management",
        "body": "Hi $[NAME],\n\nYour efficiency is notable. I’m $[OWNER_NAME], in detailing, with time-saving tips.\n\nFree for a 5-min call? No sales, pure value.\n\n$[LINK]\n\nReply with 👍 if interested.\n\nP.S. Check this meme: $[MEME-URL]"
    },
    {
        "subject": "quick question on paint correction",
        "body": "Hi $[NAME],\n\nYour paint correction is excellent. I’m $[OWNER_NAME], detailing enthusiast, with correction insights.\n\nGot 5 mins to talk? No pitch, just ideas.\n\n$[LINK]\n\nReply with 👍 if interested.\n\nP.S. Funny meme: $[MEME-URL]"
    },
    {
        "subject": "quick question on mobile detailing",
        "body": "Hi $[NAME],\n\nYour mobile service is great. I’m $[OWNER_NAME], in auto detailing, with mobile tips.\n\nUp for a 5-min chat? No selling, just value.\n\n$[LINK]\n\nReply with 👍 if interested.\n\nP.S. Meme time: $[MEME-URL]"
    },
    {
        "subject": "quick question on eco-friendly products",
        "body": "Hi $[NAME],\n\nYour eco focus is inspiring. I’m $[OWNER_NAME], detailing pro, with green product ideas.\n\nFree for a 5-min call? No sales, just networking.\n\n$[LINK]\n\nReply with 👍 if interested.\n\nP.S. Fun meme: $[MEME-URL]"
    },
    {
        "subject": "quick question on client scheduling",
        "body": "Hi $[NAME],\n\nYour scheduling is smooth. I’m $[OWNER_NAME], in detailing, with booking tips.\n\nGot 5 mins to connect? No pitch, pure value.\n\n$[LINK]\n\nReply with 👍 if interested.\n\nP.S. Meme alert: $[MEME-URL]"
    },
    {
        "subject": "quick question on leather care",
        "body": "Hi $[NAME],\n\nYour leather work is pristine. I’m $[OWNER_NAME], detailing veteran, with care insights.\n\nUp for a 5-min chat? No selling, just ideas.\n\n$[LINK]\n\nReply with 👍 if interested.\n\nP.S. Funny meme: $[MEME-URL]"
    },
    {
        "subject": "quick question on marketing ideas",
        "body": "Hi $[NAME],\n\nYour brand stands out. I’m $[OWNER_NAME], in auto detailing, with marketing tips.\n\nFree for a 5-min call? No sales, just value.\n\n$[LINK]\n\nReply with 👍 if interested.\n\nP.S. Check this meme: $[MEME-URL]"
    },
    {
        "subject": "quick question on quality control",
        "body": "Hi $[NAME],\n\nYour consistency is impressive. I’m $[OWNER_NAME], detailing pro. Got quality tips to share.\n\nGot 5 mins to talk? No pitch, just networking.\n\nPlease reply with 👍 if interested.\n\nP.S. Meme for you: $[MEME-URL]"
    },
    {
        subject: "Your ceramic coating clients aren't seeing the value",
        body: `Hi $[NAME],

I visited your website - your paint correction work is exceptional. But your ceramic coating page doesn't show *why* it's worth $1,200+.

Quick fix: Add these 3 comparison photos that convert 42% better. 

5 mins to show you examples? 

$[LINK]

P.S. This meme explains the client mindset perfectly: $[MEME-URL]`,
    },
    {
        subject: "How DetailPro in $[CITY] doubled ceramic coating sales",
        body: `$[NAME],

$[COMPANY_NAME] increased ceramic upgrades from 22% to 48% using simple wording changes.

I can share their exact script + pricing strategy.

Interested in the 7-minute breakdown? 

👉 $[LINK]

(Meme their team sent after results: $[MEME-URL])`,
    },
    {
        subject: "The Tesla owner opportunity you're missing",
        body: `Hi $[NAME],

EV owners in $[CITY] pay 2x more for coatings but hate dealership upsells.

I'm helping detailers claim this market with a 3-part email sequence.

Want the template? 

$[LINK]

P.S. This meme kills in Tesla groups: $[MEME-URL]`,
    },
    {
        subject: "Why clients think ceramic = expensive wax",
        body: `$[NAME],

That meme every detailer shares? $[MEME-URL]

It's why 60% of clients undervalue coatings. 

I'll show you how $[COMPANY_NAME] fixed this with:
1. Before/after microscope shots
2. Insurance analogy script
3. Payment plans that convert

8 mins to explain? 

$[LINK]`,
    },
    {
        subject: "Your last Instagram post could've booked 3 coatings",
        body: `Hi $[NAME],

That matte wrap detail you posted? 🔥 

Here's how to turn followers into $1,500+ coating clients:

1. Add "Ask about ceramic" CTA
2. Show 5-year cost comparison
3. Client testimonial carousel

Want the exact post template? 

Reply with 🚗

P.S. Viral meme for EV owners: $[MEME-URL]`,
    },
    {
        subject: "3 phrases killing your ceramic upgrades",
        body: `$[NAME],

"Want protection?" 
"How about ceramic?"
"Trust me, it's worth it"

These cost detailers 47% of potential upsells. 

The fix? 5-word scripts that work. 

6 mins to share examples? 

$[LINK]

P.S. When I tried this meme $[MEME-URL], bookings jumped`,
    },
    {
        subject: "Why your $1,500 coating looks like $500 online",
        body: `Hi $[NAME],

Your ceramic work deserves premium pricing, but your photos show swirl marks. 

Quick fix: Use cross-polarized lighting shots that show true depth.

I can send you our studio setup guide. 

Interested? 

$[LINK]

(Meme your clients will share: $[MEME-URL])`,
    },
    {
        subject: "How $[COMPETITOR] gets 73% coating acceptance",
        body: `$[NAME],

$[COMPETITOR] uses simple before/after videos that take 2 mins to film.

I helped them structure these 3 key frames:

1. Water beading comparison
2. Scratch resistance demo
3. Client reaction close-up

Want the shot list? 

$[LINK]`,
    },
    {
        subject: "Your clients would pay more if they understood this",
        body: `Hi $[NAME],

Ceramic isn't about shine - it's about $2,800 in long-term savings. 

Most detailers never explain the ROI. 

I'll share the exact calculator $[COMPANY_NAME] uses to justify premium pricing. 

8 mins to walk through it? 

$[LINK]

P.S. Meme that makes the math click: $[MEME-URL]`,
    },
    {
        subject: "The unspoken reason clients reject coatings",
        body: `$[NAME],

It's not the price - it's the uncertainty. 

I'm helping detailers overcome this with:
- 7-year guarantee templates
- Side-by-side wear comparisons
- "Test spot" offers

Want the playbook? 

Reply with 🔧

(Meme that explains the anxiety: $[MEME-URL])`,
    },
    {
        subject: "How to turn 1-time clients into coating subscribers",
        body: `Hi $[NAME],

Your maintenance wash clients would pay $89/month for ceramic refresh plans. 

I'm helping shops implement this with:

1. Automated reminder system
2. Tiered package options
3. Loyalty discounts

Case study? 

$[LINK]`,
    },
    {
        subject: "Your competition's secret coating pitch",
        body: `$[NAME],

Top detailers use "The 3 C's Framework":
- Cost comparison
- Chemical resistance 
- Client testimonials 

I can send you exact scripts + email templates. 

Interested? 

$[LINK]

P.S. This meme converts better than sales pages: $[MEME-URL]`,
    },
    {
        subject: "Why your ceramic clients aren't referring friends",
        body: `Hi $[NAME],

They love your work - but forget to share. 

Simple fix: Automated post-service SMS with:
1. Shareable before/after collage
2. $100 referral credit
3. Pre-written caption 

Want the exact flow? 

$[LINK]

(Meme clients actually forward: $[MEME-URL])`,
    },
    {
        subject: "The coating upgrade trick 90% of detailers miss",
        body: `$[NAME],

Offer ceramic during the wash dry phase - acceptance rates jump 38%. 

I'll show you the exact timing and phrasing. 

5 mins to explain? 

$[LINK]`,
    },
    {
        subject: "How to justify premium ceramic pricing",
        body: `Hi $[NAME],

"$1,500 seems high" → "That's $0.68/day over 6 years" 

I'm helping detailers reframe pricing with:
- Daily cost breakdowns 
- Warranty comparisons
- Mobile app maintenance tracking 

Want the calculator template? 

Reply with 💰`,
    },
    {
        subject: "Your website's missing these 3 coating triggers",
        body: `$[NAME],

1. Year 3 vs Year 5 paint comparison 
2. Insurance claim case study
3. "Why Ceramic?" video above fold

I can send examples that convert at 29%. 

Interested? 

$[LINK]

P.S. This meme explains client doubts perfectly: $[MEME-URL]`,
    },
    {
        subject: "The real reason clients choose ceramic",
        body: `Hi $[NAME],

It's not protection - it's social proof. 

I'll show you how $[COMPANY_NAME] uses:
- Client garage shots 
- Brand partnership badges
- "Featured in" media logos 

5 mins to share the strategy? 

$[LINK]`,
    },
    {
        subject: "How to upsell coatings without being salesy",
        body: `$[NAME],

Instead of "Want ceramic?" try:

"Most clients protect their investment with either Option A ($X) or B ($Y) - which makes sense for you?"

Scripts and pricing tiers attached. 

Want them? 

Reply with 🛡️`,
    },
    {
        subject: "Your ceramic clients would pay 30% more for this",
        body: `Hi $[NAME],

Mobile maintenance plans. 

I'm helping detailers offer:
- Quarterly inspections
- Topper applications
- Touch-up services 

All automated, all profitable. 

Case study? 

$[LINK]

P.S. Meme their clients share: $[MEME-URL]`,
    },
    {
        subject: "Why Instagram isn't booking coatings",
        body: `$[NAME],

Beautiful detail shots ≠ sales. 

The fix? Post breakdown videos showing:
1. Contaminant removal 
2. Coating application 
3. 1-year checkup 

I can send you our filming checklist. 

Want it? 

$[LINK]`,
    },
    {
        subject: "The coating warranty clients actually want",
        body: `Hi $[NAME],

Not 7 years - 7 touch-ups. 

I'm helping shops structure maintenance plans that: 
- Increase LTV 4x
- Create consistent revenue
- Boost referrals 

5 mins to explain? 

$[LINK]

(Meme that sells the plan: $[MEME-URL])`,
    },
    {
        subject: "How Detail Garage tripled coating sales",
        body: `$[NAME],

Secret: They show PPF vs ceramic vs wax under microscope. 

I can send you their: 
- Video script
- Comparison charts
- Email sequence 

Want the assets? 

Reply with 🔍`,
    },
    {
        subject: "Your perfect ceramic client is searching now",
        body: `Hi $[NAME],

High-income homeowners near $[CITY] are Googling:
- "Tesla paint protection"
- "Ceramic coating warranty"
- "Detailing maintenance plans"

I can show you how to claim these searches. 

Interested? 

$[LINK]`,
    },
    {
        subject: "The coating presentation trick that never fails",
        body: `$[NAME],

Park next to uncoated same-model cars. 

I'll share how $[COMPANY_NAME] uses this to: 
- Eliminate price objections
- Create urgency 
- Generate referrals 

Want the playbook? 

$[LINK]

P.S. Clients send this meme after seeing it: $[MEME-URL]`,
    },
    {
        subject: "Why your coating price seems high",
        body: `Hi $[NAME],

You're showing cost, not value. 

Quick fix: Break it into: 
- $X/year protection 
- $Y saved on washes
- $Z resale value 

I can send the exact calculator. 

Need it? 

Reply with 🧮`,
    },
    {
        subject: "The unspoken truth about ceramic warranties",
        body: `$[NAME],

Clients care more about maintenance than duration. 

I'm helping shops offer: 
- Free annual inspections
- Discounted toppers
- Mobile service options 

5 min case study? 

$[LINK]`,
    },
    {
        subject: "How to turn 1 coating into 3 referrals",
        body: `Hi $[NAME],

The secret: Client before/after videos with "Tag a friend" offers. 

I'll show you how $[COMPANY_NAME] gets 2.7 shares per post. 

Want their exact script? 

$[LINK]

P.S. This meme goes viral: $[MEME-URL]`,
    },
    {
        subject: "Your website's missing these coating FAQs",
        body: `$[NAME],

"Does ceramic prevent scratches?"
"Can I wash normally?"
"Why not just wax?"

Answer these 7 questions → 31% more bookings. 

I can send the exact Q&A. 

Need it? 

Reply with ❓`,
    },
    {
        subject: "The Tesla loophole every detailer misses",
        body: `Hi $[NAME],

New owners must wait 30 days for PPF/coatings. 

Perfect time to: 
1. Send care packages
2. Book future appointments
3. Build loyalty 

I'll share the exact sequence. 

$[LINK]

(Meme Tesla owners love: $[MEME-URL])`,
    },
    {
        subject: "Why your coating clients aren't repeating",
        body: `$[NAME],

They forget about maintenance. 

Automated solution: 
- Yearly inspection reminders
- Mobile topper service
- Referral discounts 

Case study showing 43% repeat rate? 

$[LINK]`,
    },
    {
        subject: "The garage shot that sells coatings",
        body: `Hi $[NAME],

Clients want their car to look showroom-ready at home. 

I'll show you how to: 
1. Photograph in client garages
2. Add "Protected by" decals 
3. Create social proof loops 

Want examples? 

$[LINK]

P.S. This meme explains the desire: $[MEME-URL]`,
    },
    {
        subject: "How to justify ceramic during economic dips",
        body: `$[NAME],

"Protect your investment" > "Luxury expense"

I'm helping detailers pivot messaging to: 
- Resale value protection
- Long-term savings
- Warranty partnerships 

Want the playbook? 

Reply with 📉`,
    },
    {
        subject: "Your Google My Profile is costing coatings",
        body: `Hi $[NAME],

Missing: 
- Coating service menu
- Before/after photos
- "How it works" video 

Fix these → 28% more lead conversion. 

I can send exact examples. 

Need them? 

$[LINK]`,
    },
    {
        subject: "The detailer's guide to recession-proof pricing",
        body: `$[NAME],

Offer: 
1. Coatings (high margin)
2. Maintenance plans (recurring)
3. Referral credits (low cost)

I'll share how $[COMPANY_NAME] grew during downturns. 

5 mins? 

$[LINK]

P.S. Meme that sells stability: $[MEME-URL]`,
    },
    {
        subject: "Why clients choose dealers over you",
        body: `Hi $[NAME],

It's not quality - it's financing. 

Offer 0% APR through $[PARTNER] → coating sales jump 65%. 

I can connect you. 

Interested? 

Reply with 💳`,
    },
    {
        subject: "The Instagram filter that sells coatings",
        body: `$[NAME],

Use "Detail View" to show: 
- Water beading
- Paint depth
- Sunlight reflection 

I'll send you the exact filter + caption formula. 

Want it? 

$[LINK]

(Meme clients use: $[MEME-URL])`,
    },
    {
        subject: "How to turn complaints into coating sales",
        body: `Hi $[NAME],

Client says "Swirls came back" → "This wouldn't happen with ceramic" 

I'm sharing 3 scripts that convert 22% of complaints. 

Need them? 

Reply with 😠`,
    },
    {
        subject: "The PPF upsell every coating client needs",
        body: `$[NAME],

"Full front PPF + ceramic" packages convert 38% better than standalone. 

I'll show you how to: 
- Bundle services
- Stage comparisons
- Offer financing 

Case study? 

$[LINK]`,
    },
    {
        subject: "Why your Yelp reviews aren't booking coatings",
        body: `Hi $[NAME],

Clients mention shine, not protection. 

Train them to write reviews that sell: 
"Thanks for protecting my investment!"
"Worth every penny long-term" 

I can share the exact follow-up email. 

Want it? 

$[LINK]`,
    },
    {
        subject: "The maintenance plan detailers forget",
        body: `$[NAME],

Offer free annual inspections with: 
- Touch-up services
- Topper applications 
- Photo reports 

Creates 73% repeat rate. 

I'll send the workflow. 

Need it? 

Reply with 🔄`,
    },
    {
        subject: "How to make coatings urgent",
        body: `Hi $[NAME],

"New car protection windows close at 1,000 miles" 

I'm helping detailers use: 
- Countdown timers 
- OEM paint cure data
- Limited slots 

Want the exact strategy? 

$[LINK]

P.S. Meme that creates FOMO: $[MEME-URL]`,
    },
    {
        subject: "The email sequence that books coatings",
        body: `$[NAME],

3 emails every new client gets: 
1. "Your Paint's Enemies" 
2. "5-Year Cost Comparison"
3. "Last Appointment Slot" 

Converts 19% to coatings. 

Want the templates? 

$[LINK]`,
    },
    {
        subject: "Why mobile detailing kills coating sales",
        body: `Hi $[NAME],

No controlled lighting → Can't show true results. 

Solution: Portable LED panels + microscope cam. 

I can recommend the $1,200 kit that pays for itself in 2 jobs. 

Interested? 

Reply with 💡`,
    },
    {
        subject: "The certification that justifies premium pricing",
        body: `$[NAME],

Get $[CERAMIC_BRAND] certified → Charge 35% more. 

I'll walk you through: 
- Application process
- Marketing materials
- Client presentation 

30 mins to discuss? 

$[LINK]`,
    },
    {
        subject: "How to turn washes into coating leads",
        body: `Hi $[NAME],

Add to wash confirmations: 
"Your paint is 73% unprotected → Book free inspection" 

Converts 12% to consultations. 

Want the exact automation? 

$[LINK]

P.S. Meme that explains the risk: $[MEME-URL]`,
    },
    {
        subject: "The unexpected coating client demographic",
        body: `$[NAME],

Minivan moms pay 22% more for coatings than sports car owners. 

I'll show you how to: 
- Target school parking lots
- Highlight stain resistance
- Offer family discounts 

Case study? 

Reply with 👩👧👦`,
    },
    {
        subject: "Why your coating doesn't look 'thick'",
        body: `Hi $[NAME],

Clients expect visible layers. 

Solution: Application videos showing: 
- Multiple layers 
- Curing process
- Depth comparisons 

I can send example edits. 

Need them? 

$[LINK]`,
    },
    {
        subject: "The detailer's recession playbook",
        body: `$[NAME],

Focus on: 
1. Ceramic maintenance plans
2. PPF spot repairs
3. Fleet contracts 

I'm helping shops pivot with 92% retention. 

Want the guide? 

$[LINK]

P.S. Meme that calms price fears: $[MEME-URL]`,
    },
    {
        subject: "How to beat dealer coating prices",
        body: `Hi $[NAME],

"Same warranty, half price" 

But you need: 
- OEM certification 
- Loaner car program
- Free annual inspections 

I'll show you how $[COMPANY_NAME] does it. 

Interested? 

Reply with 🥊`,
    },
    {
        "subject": "quick question on coating prices",
        "body": "Hi $[NAME],\nYour coatings are stunning. Many detailers undercharge, losing profits.\nA shop boosted sales 37% with one tweak.\n27 seconds to peek? $[LINK]\nWhen clients say ‘Coating’s just wax?’ 😤: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on booking clients",
        "body": "Hi $[NAME],\nYour detailing is top-notch. Struggling to fill your schedule?\nA shop booked 7 clients in days.\n27 seconds to see how? $[LINK]\nWhen clients ghost you 😩: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on ceramic myths",
        "body": "Hi $[NAME],\nYour work shines. Clients confused about ceramic coatings?\nA detailer clarified myths, upped sales 20%.\n27 seconds to check? $[LINK]\nWhen clients ask ‘Why so pricey?’ 😅: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on time-saving tools",
        "body": "Hi $[NAME],\nYour efficiency impresses. Spending too long on interiors?\nA shop cut detailing time 30%.\n27 seconds to peek? $[LINK]\nWhen tools slow you down 😖: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on client retention",
        "body": "Hi $[NAME],\nYour reviews are stellar. Losing repeat clients?\nA detailer doubled loyalty with one trick.\n27 seconds to see it? $[LINK]\nWhen clients don’t return 😞: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on paint correction",
        "body": "Hi $[NAME],\nYour corrections are flawless. Clients undervaluing your skill?\nA shop raised prices 25%.\n27 seconds to check? $[LINK]\nWhen clients haggle 😣: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on eco products",
        "body": "Hi $[NAME],\nYour green focus is inspiring. Eco products too costly?\nA detailer cut costs 15% sustainably.\n27 seconds to peek? $[LINK]\nWhen eco goes wrong 😬: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on marketing hacks",
        "body": "Hi $[NAME],\nYour brand stands out. Need more local clients?\nA shop tripled leads fast.\n27 seconds to see how? $[LINK]\nWhen ads flop 😵: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on waxing profits",
        "body": "Hi $[NAME],\nYour waxing is pristine. Underpricing your services?\nA detailer upped waxing revenue 40%.\n27 seconds to check? $[LINK]\nWhen clients skip wax 😒: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on coating sales",
        "body": "Hi $[NAME],\nYour coatings are elite. Low coating bookings?\nA shop sold 5 coatings in a week.\nReply with 🚗 to learn how.\nWhen coatings don’t sell 😓: $[MEME-URL]"
    },
    {
        "subject": "quick question on mobile detailing",
        "body": "Hi $[NAME],\nYour mobile service rocks. Logistics eating time?\nA detailer streamlined ops, saved 10 hours.\n27 seconds to peek? $[LINK]\nWhen traffic hits 😤: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on leather care",
        "body": "Hi $[NAME],\nYour interiors are flawless. Leather care too slow?\nA shop cut cleaning time 25%.\n27 seconds to see it? $[LINK]\nWhen leather stains persist 😩: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on pricing strategy",
        "body": "Hi $[NAME],\nYour quality is unmatched. Clients paying too little?\nA detailer raised prices, kept clients.\n27 seconds to check? $[LINK]\nWhen prices feel low 😞: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on shop efficiency",
        "body": "Hi $[NAME],\nYour workflow is solid. Still feel rushed?\nA shop saved 2 hours daily.\n27 seconds to peek? $[LINK]\nWhen time runs out 😵: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on client education",
        "body": "Hi $[NAME],\nYour work is stellar. Clients misunderstanding services?\nA detailer boosted sales by educating.\n27 seconds to see how? $[LINK]\nWhen clients don’t get it 😅: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on social media",
        "body": "Hi $[NAME],\nYour photos pop. Social media not converting?\nA shop doubled followers fast.\n27 seconds to check? $[LINK]\nWhen posts flop 😖: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on tire shines",
        "body": "Hi $[NAME],\nYour tire work is crisp. Products underperforming?\nA detailer found a game-changer.\n27 seconds to peek? $[LINK]\nWhen tires don’t shine 😒: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on upselling",
        "body": "Hi $[NAME],\nYour detailing is elite. Missing upsell chances?\nA shop added 30% to revenue.\n27 seconds to see how? $[LINK]\nWhen upsells fail 😣: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on shop branding",
        "body": "Hi $[NAME],\nYour brand is sharp. Need a bigger reach?\nA detailer grew their name fast.\n27 seconds to check? $[LINK]\nWhen branding stalls 😬: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on repeat business",
        "body": "Hi $[NAME],\nYour quality is top-tier. Clients not returning?\nA shop doubled repeat bookings.\nReply with 🚗 to learn how.\nWhen loyalty dips 😓: $[MEME-URL]"
    },
    {
        "subject": "quick question on waterless washing",
        "body": "Hi $[NAME],\nYour eco-friendly approach shines. Waterless washing tricky?\nA detailer saved 60% water with one method.\n27 seconds to peek? $[LINK]\nWhen water’s scarce 💧: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on nano coatings",
        "body": "Hi $[NAME],\nYour coatings are next-level. Tried nano-tech yet?\nA shop boosted retention 30% with nano.\n27 seconds to check? $[LINK]\nWhen shine lasts 🔬: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on subscription plans",
        "body": "Hi $[NAME],\nYour subscriptions are smart. Keeping clients hooked?\nA detailer grew repeat business 40%.\n27 seconds to see how? $[LINK]\nWhen clients stay 📅: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on booking apps",
        "body": "Hi $[NAME],\nYour bookings are smooth. Using the best apps?\nA shop increased bookings 25% with one.\n27 seconds to peek? $[LINK]\nWhen clients want now ⏱️: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on virtual consults",
        "body": "Hi $[NAME],\nYour virtual consults are innovative. Closing deals fast?\nA detailer used video to boost sales.\n27 seconds to check? $[LINK]\nWhen distance doesn’t matter 📱: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on ai tools",
        "body": "Hi $[NAME],\nYour tech use is cool. Tried AI for workflows?\nA shop cut time 20% with AI.\n27 seconds to see how? $[LINK]\nWhen tech saves time 🤖: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on green packaging",
        "body": "Hi $[NAME],\nYour eco focus is great. Using sustainable packaging?\nA detailer upped sales 15% with it.\n27 seconds to peek? $[LINK]\nWhen packaging goes green ♻️: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on steam cleaning",
        "body": "Hi $[NAME],\nYour steam cleaning is effective. Maximizing its benefits?\nA shop cut chemical use 50%.\n27 seconds to check? $[LINK]\nWhen steam saves 🧼: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on dry ice cleaning",
        "body": "Hi $[NAME],\nYour dry ice cleaning is unique. How’s it working?\nA detailer saved hours on tough grime.\n27 seconds to peek? $[LINK]\nWhen dirt fights back ❄️: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on fleet detailing",
        "body": "Hi $[NAME],\nYour fleet work is efficient. Handling big jobs?\nA shop cut fleet time 30%.\nReply with 🚗 to learn how.\nWhen fleets need shine 🚚: $[MEME-URL]"
    },
    {
        "subject": "quick question on pre-sale prep",
        "body": "Hi $[NAME],\nYour pre-sale detailing is spot-on. Maximizing car value?\nA shop increased sale prices 10%.\n27 seconds to peek? $[LINK]\nWhen prep pays off 💰: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on odor removal",
        "body": "Hi $[NAME],\nYour odor removal is impressive. Tough smells lingering?\nA detailer eliminated odors faster.\n27 seconds to check? $[LINK]\nWhen smells won’t budge 😷: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on headlight restoration",
        "body": "Hi $[NAME],\nYour headlight work is clear. Restoration taking too long?\nA shop cut time 20%.\n27 seconds to peek? $[LINK]\nWhen lights stay dim 💡: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on pet hair removal",
        "body": "Hi $[NAME],\nYour interior cleaning is great. Pet hair a hassle?\nA detailer mastered quick removal.\n27 seconds to see how? $[LINK]\nWhen fur takes over 🐶: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on vinyl wrapping",
        "body": "Hi $[NAME],\nYour wraps are sleek. Wrapping costs too high?\nA shop reduced expenses 15%.\n27 seconds to peek? $[LINK]\nWhen wraps get pricey 🎨: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on glass cleaning",
        "body": "Hi $[NAME],\nYour glass work is crystal-clear. Streaks slowing you down?\nA detailer found a streak-free trick.\n27 seconds to check? $[LINK]\nWhen glass stays spotty 🪟: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on clay bar use",
        "body": "Hi $[NAME],\nYour clay bar results are smooth. Process too slow?\nA shop sped up claying 25%.\n27 seconds to peek? $[LINK]\nWhen clay takes forever 🧱: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on sealant application",
        "body": "Hi $[NAME],\nYour sealants shine. Application eating time?\nA detailer cut sealant time 20%.\n27 seconds to see how? $[LINK]\nWhen sealants drag ⏳: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on wheel cleaning",
        "body": "Hi $[NAME],\nYour wheels sparkle. Brake dust a pain?\nA shop mastered quick cleaning.\n27 seconds to peek? $[LINK]\nWhen wheels stay dirty 🛞: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on customer referrals",
        "body": "Hi $[NAME],\nYour clients love you. Need more referrals?\nA shop doubled word-of-mouth leads.\nReply with 🚗 to learn how.\nWhen referrals slow 📢: $[MEME-URL]"
    },
    {
        "subject": "quick question on seasonal packages",
        "body": "Hi $[NAME],\nYour packages are smart. Seasonal deals working?\nA shop boosted off-season sales 30%.\n27 seconds to peek? $[LINK]\nWhen seasons shift 🍂: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on express detailing",
        "body": "Hi $[NAME],\nYour express service is fast. Keeping quality high?\nA shop perfected quick detailing.\n27 seconds to check? $[LINK]\nWhen speed meets shine ⚡: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on loyalty programs",
        "body": "Hi $[NAME],\nYour loyalty program is cool. Clients sticking around?\nA shop increased retention 35%.\n27 seconds to see how? $[LINK]\nWhen loyalty shines ⭐: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on online reviews",
        "body": "Hi $[NAME],\nYour reviews are glowing. Need more online buzz?\nA shop tripled 5-star ratings.\n27 seconds to peek? $[LINK]\nWhen reviews matter 🌟: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on team training",
        "body": "Hi $[NAME],\nYour team’s skills are solid. Training up to speed?\nA shop improved quality via training.\n27 seconds to check? $[LINK]\nWhen skills need polish 🛠️: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on inventory management",
        "body": "Hi $[NAME],\nYour supplies are organized. Stock issues slowing you?\nA shop optimized inventory flow.\n27 seconds to peek? $[LINK]\nWhen stock runs low 📦: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on client follow-ups",
        "body": "Hi $[NAME],\nYour follow-ups are great. Boosting repeat visits?\nA shop increased returns 20%.\n27 seconds to see how? $[LINK]\nWhen follow-ups work 📧: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on premium packages",
        "body": "Hi $[NAME],\nYour premium services shine. Selling enough high-end?\nA shop doubled premium sales.\n27 seconds to peek? $[LINK]\nWhen luxury sells 💎: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on shop cleanliness",
        "body": "Hi $[NAME],\nYour shop looks pristine. Keeping it client-ready?\nA shop impressed with cleanliness.\n27 seconds to check? $[LINK]\nWhen mess creeps in 🧹: $[MEME-URL]\nReply with 🚗 if this resonates."
    },
    {
        "subject": "quick question on client wait times",
        "body": `Hi $[NAME],\nYour service is quick. Clients waiting too long?\nA shop cut wait times 25%.\nReply with 🚗 to learn how.\nWhen clients wait ⏰: $[MEME-URL`
    }
];
exports.default = emails;
