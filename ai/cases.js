/* AI demo scripts, one object per build, played by demo.js. A case has topics; a topic has beats (say, card, choices, trace). Every reply is written ahead. */
(window.AI_CASES ||= []).push({
  id: "store",
  site: "ai-store-site.webp",
  domain: "www.hollisandvane.com",
  tab: "Online store",
  icon: "bag",
  name: "Store assistant",
  status: "Replies instantly · 2:14 AM",
  accent: "#c4643a",
  who: "You're a shopper on a linen clothing store at 2 AM.",
  pitch: "Answers sizing, stock and shipping at any hour, tracks orders, starts returns, and hands damaged or lost parcels to a person.",
  plan: "On your Claude or Codex plan, or pay-as-you-go with a cap you set",
  budget: { spent: 21.4, cap: 40, per: 0.004 },
  brief: "An AI assistant for my online store that answers sizing, stock and shipping questions, tracks orders and starts returns",
  team: "our care team",
  replyBy: "by 9 AM",
  greeting: [
    { say: "Hi! I can help with sizing, stock, shipping, returns or an order. What are you looking at?" },
  ],
  start: ["size", "order", "damaged", "discount"],
  menu: ["sizehelp", "colours", "fabric", "gift", "cancel", "address", "intl", "startreturn", "refundstatus", "payment", "account", "wholesale"],
  topics: {
    size: {
      ask: "Is the linen camp shirt true to size? I'm usually a medium.",
      chip: "Is the linen shirt true to size?",
      keys: ["size", "sizing", "fit", "fits", "true to size", "normally a", "im a medium", "runs big", "runs small", "runs large", "tight", "loose", "baggy", "oversized", "snug", "size down", "size up", "usually a"],
      beats: [
        {
          trace: [
            ["understand", "Sizing question", "Camp Collar Shirt · Washed Linen · usually wears M"],
            ["check", "Fit notes", "Cut runs ½ size big · from size chart + 212 reviews"],
            ["check", "Stock · Oat", "XS 6 · S 11 · M 3 · L 9 · XL 4 · XXL sold out"],
            ["rule", "Low stock", "Under 5 left → say it plainly, no pressure"],
          ],
          say: "It runs about half a size big, so most people size down. Medium has **3 left**, and Small fits like a regular medium if you like it a bit closer.",
          card: { title: "Camp Collar Shirt · Oat", meta: "Washed Linen · Size M · $98", pill: "3 left", tone: "warn", rows: [["Reviews", "4.8 · 212 reviews"], ["Fit", "Runs ½ size big"]], actions: [{ label: "Add M to bag", go: "add" }] },
          choices: [
            { label: "Help me pick by height", go: "sizehelp" },
            { label: "Add the medium", go: "add" },
          ],
        },
      ],
      next: ["sizehelp", "colours", "returns"],
    },
    sizehelp: {
      ask: "I'm 5'10\", about 175 lb, chest around 40 inches. Small or medium?",
      chip: "Pick my size by height",
      keys: ["height", "weight", "tall", "5'10", "175", "lbs", "pounds", "chest", "inches", "measure", "measurement", "size chart", "between sizes", "small or medium", "which size", "recommend a size", "size guide", "build", "what size", "recommend", "6ft"],
      beats: [
        {
          trace: [
            ["understand", "Size help", "5'10\" · 175 lb · chest 40 in · torn between S and M"],
            ["check", "Size chart · body", "S fits chest 36–38 · M 39–41 · L 42–44"],
            ["check", "Size chart · garment", "S 42 in chest, 28 in long · M 44 in, 29 in long"],
            ["check", "Reviews · similar build", "38 reviewers 5'9\"–5'11\": 61% kept M, 39% kept S"],
          ],
          say: "With a 40 in chest you're a true **Medium** on our chart, and it'll sit relaxed, which is how the shirt is cut. Small works if you want it closer, like a regular-brand medium. Both are below:",
          card: { title: "S vs M · Camp Collar Shirt", meta: "Garment measurements", rows: [["Chest", "S 42 in · M 44 in"], ["Length", "S 28 in · M 29 in"], ["Shoulder", "S 18 in · M 18.5 in"], ["In stock · Oat", "S 11 · M 3"]], tone: "info" },
          choices: [
            { label: "Relaxed, add the medium", go: "add" },
            { label: "Closer fit, I'll go small", go: "swapsize" },
            { label: "What if it doesn't fit?", go: "returns" },
          ],
        },
      ],
      next: ["add", "swapsize", "returns"],
    },
    add: {
      ask: "Add the medium to my bag.",
      chip: "Add the medium",
      keys: ["add to bag", "add it", "bag", "cart", "basket", "buy", "take it", "i'll take", "checkout", "order it", "purchase", "get the medium"],
      beats: [
        {
          trace: [
            ["act", "Added to bag", "SKU LCS-OAT-M × 1 · $98"],
            ["guard", "Price from the store", "The chat can't set or change prices"],
            ["check", "Free-shipping rule", "Bag $98 ≥ $75 → shipping free"],
            ["rule", "Bag doesn't hold stock", "Only 3 left → say so, no fake countdown"],
          ],
          say: "Done, it's in your bag. You're over $75, so shipping is free. Just so you know, a bag doesn't reserve stock, and there are 3 mediums left.",
          card: { title: "Your bag", rows: [["Camp Collar Shirt · Oat · M", "$98"], ["Shipping", "Free"], ["Total", "$98"]], pill: "Saved", tone: "ok" },
        },
      ],
      next: ["ship", "swapsize", "gift", "payment"],
    },
    swapsize: {
      ask: "Actually, make it a small instead.",
      chip: "Make it a small",
      keys: ["actually", "make it a small", "switch to small", "change to small", "swap to", "the small", "small one", "changed my mind", "go small", "size small"],
      beats: [
        {
          trace: [
            ["understand", "Change of mind", "Swap M → S in the bag · same colour"],
            ["check", "Stock · Oat S", "11 left"],
            ["act", "Bag updated", "Removed LCS-OAT-M · added LCS-OAT-S"],
            ["check", "Free-shipping rule", "Still $98 ≥ $75 → free"],
          ],
          say: "No problem, swapped. It's the **Small in Oat** now, same $98 and still free shipping. If it ends up too close, exchanges are free.",
          card: { title: "Your bag", rows: [["Camp Collar Shirt · Oat · S", "$98"], ["Shipping", "Free"]], pill: "Updated", tone: "ok" },
        },
      ],
      next: ["ship", "returns", "payment"],
    },
    colours: {
      ask: "What other colours does it come in?",
      chip: "Other colours?",
      keys: ["other colours", "other colors", "come in", "which colours", "which colors", "colours available", "sage", "indigo", "clay", "navy", "green", "blue", "darker", "lighter", "shades", "in stock colours"],
      beats: [
        {
          trace: [
            ["understand", "Colour options", "Camp Collar Shirt · wants to see what's in stock"],
            ["check", "Stock · all colours", "Oat · Sage · Indigo in stock · Clay sold out"],
            ["check", "Stock · size M", "Oat 3 · Sage 8 · Indigo 7 · Clay 0"],
            ["rule", "Sold out", "Show it, offer a back-in-stock email, never a date we can't keep"],
          ],
          say: "Four colours: **Oat**, **Sage** and **Indigo** are in stock, and **Clay** is sold out right now. Want me to email you when Clay is back?",
          card: { title: "Camp Collar Shirt · colours", meta: "All $98 · Washed Linen", rows: [["Oat", "In stock · M 3 left"], ["Sage", "In stock · M 8"], ["Indigo", "In stock · M 7"], ["Clay", "Sold out"]], tone: "info", actions: [{ label: "Notify me about Clay", go: "restock" }] },
        },
      ],
      next: ["restock", "add", "fabric"],
    },
    restock: {
      ask: "Can you tell me when Clay is back in a medium?",
      chip: "Notify me when it's back",
      keys: ["notify", "notify me", "back in stock", "restock", "sold out", "out of stock", "waitlist", "wait list", "when will it be back", "email me when", "alert me", "xxl", "coming back", "unavailable"],
      beats: [
        {
          trace: [
            ["understand", "Back-in-stock alert", "Clay · size M"],
            ["check", "Purchase orders", "Clay restock in production · est. early November"],
            ["guard", "No promised dates", "Share the estimate, never commit to a day"],
            ["act", "Subscribed", "Back-in-stock email · Clay M · one message only"],
          ],
          say: "You're on the list. I'll email you once when **Clay in M** is back, nothing else unless you sign up for the newsletter. The team expects it early November, but I won't promise a date.",
          card: { title: "Back-in-stock alert", meta: "Clay · Size M", pill: "Subscribed", tone: "ok", rows: [["Expected", "Early November (estimate)"], ["Emails", "One, when it's back"]] },
        },
      ],
      next: ["colours", "add", "discount"],
    },
    fabric: {
      ask: "Does the linen wrinkle a lot? And how do I wash it?",
      chip: "Does linen wrinkle?",
      keys: ["wrinkle", "wrinkles", "crease", "wash", "washing", "care", "iron", "ironing", "shrink", "shrinkage", "dryer", "fabric", "material", "itchy", "soft", "made in", "where is it made", "sustainable", "sustainability", "eco", "ethical", "flax"],
      beats: [
        {
          trace: [
            ["understand", "Fabric and care", "Wrinkling · washing · shrinkage"],
            ["check", "Product file · fabric", "100% washed linen · pre-washed · 180 gsm"],
            ["check", "Care label", "Cold, gentle · line dry or tumble low · warm iron"],
            ["guard", "Only what's on file", "Origin from supplier certificates, no green claims beyond them"],
          ],
          say: "It does crease, but it's pre-washed, so the creases are soft and relaxed rather than crumpled. Wash cold on gentle and line dry. Shrinkage is under 2%, and only if you tumble dry hot. The flax is European, woven and sewn in Portugal.",
          card: { title: "Washed Linen · care", rows: [["Fabric", "100% linen · pre-washed"], ["Wash", "Cold · gentle cycle"], ["Dry", "Line dry or tumble low"], ["Shrinkage", "Under 2% if dried hot"], ["Made in", "Portugal · European flax"]], tone: "info" },
        },
      ],
      next: ["size", "colours", "add"],
    },
    ship: {
      ask: "When would it get to Austin?",
      chip: "When would it arrive?",
      keys: ["ship", "shipping", "deliver", "delivery time", "arrive", "when will", "how long", "austin", "business days", "express", "faster", "overnight", "rush", "same day", "shipping cost"],
      beats: [
        {
          trace: [
            ["understand", "Delivery time", "Destination: Austin, TX"],
            ["check", "Shipping rules", "Orders by 3 PM ship same day · free over $75"],
            ["check", "Carrier estimate", "UPS Ground to Austin · 2–3 business days"],
            ["check", "Express option", "$12 · next business day"],
          ],
          say: "Order before 3 PM today and it ships tonight, arriving **Thursday or Friday**. Express gets it there Wednesday for $12.",
          card: { title: "Shipping to Austin, TX", rows: [["UPS Ground", "Thu–Fri · Free over $75"], ["Express", "Wed · $12"], ["Cut-off", "3 PM for same-day dispatch"]], tone: "info" },
        },
      ],
      next: ["intl", "gift", "order"],
    },
    gift: {
      ask: "It's a gift for my brother in Denver. Can you wrap it?",
      chip: "Send it as a gift",
      keys: ["gift", "present", "wrap", "wrapping", "gift wrap", "gift receipt", "gift note", "birthday", "different address", "send to someone", "ship to my", "brother", "sister", "boyfriend", "girlfriend", "husband", "wife"],
      beats: [
        {
          trace: [
            ["understand", "Gift order", "Wrap · ship to a different address · Denver, CO"],
            ["check", "Gift options", "Linen wrap $5 · gift receipt free · note up to 200 chars"],
            ["check", "Carrier estimate", "UPS Ground to Denver · 3–4 business days"],
          ],
          say: "Of course. Gift wrap is **$5** in a reusable linen pouch, and a gift receipt (no prices) is free. You can add his Denver address as the shipping address at checkout. Want the wrap and a note?",
        },
        { from: "user", say: "Yes, wrap it. Note: Happy birthday, Sam." },
        {
          trace: [
            ["act", "Gift wrap added", "+$5 · note saved · gift receipt on"],
            ["guard", "Note checked", "No prices printed anywhere in the parcel"],
            ["check", "Bag total", "$98 + $5 wrap = $103 · shipping still free"],
          ],
          say: "Done. It'll arrive wrapped with your note and a gift receipt, so he can exchange the size for free if he needs to.",
          card: { title: "Gift order", rows: [["Camp Collar Shirt · Oat", "$98"], ["Gift wrap + note", "$5"], ["Shipping", "Free"], ["Total", "$103"]], pill: "Gift", tone: "ok" },
        },
      ],
      next: ["ship", "payment", "returns"],
    },
    discount: {
      ask: "Can you give me a discount code?",
      chip: "Can I get a discount?",
      keys: ["discount", "code", "coupon", "promo", "sale", "deal", "voucher", "percent off", "stack", "combine", "two codes", "both codes", "newsletter", "first order", "student discount"],
      beats: [
        {
          trace: [
            ["understand", "Discount request", "No code in the message"],
            ["guard", "No made-up discounts", "Codes and prices come from the store, not the chat"],
            ["check", "Live offers", "Newsletter: 10% off first order · free shipping over $75"],
            ["rule", "One code per order", "Free shipping is automatic, so it applies on top"],
          ],
          say: "I can't make up codes, but there are two real ones: **10% off** your first order when you join the newsletter, and free shipping over $75. It's one code per order, but free shipping is automatic, so you'd pay **$88.20** with free shipping.",
        },
      ],
      next: ["add", "pricematch", "size"],
    },
    pricematch: {
      ask: "I saw this exact shirt for $79 on another site. Can you match it?",
      chip: "It's cheaper elsewhere",
      keys: ["price match", "pricematch", "cheaper", "cheaper elsewhere", "another site", "other site", "lower price", "$79", "match the price", "beat the price", "too expensive", "overpriced", "pricey", "amazon"],
      beats: [
        {
          trace: [
            ["understand", "Price objection", "Says $79 elsewhere vs our $98"],
            ["guard", "No price changes in chat", "Can't match or discount, only the store sets prices"],
            ["check", "Where we sell", "Own site + 2 boutique stockists, all at $98"],
            ["act", "Flagged for the team", "Possible knockoff listing · team checks by 9 AM"],
          ],
          say: "I can't change prices here, and we don't price-match. We only sell on this site and through two boutiques, all at $98, so a $79 listing is often a copy. I've flagged it for the team. The newsletter's 10% would bring it to $88.20.",
        },
      ],
      next: ["discount", "fabric", "add"],
    },
    payment: {
      ask: "Can I pay with Apple Pay, or split it up?",
      chip: "Payment options",
      keys: ["pay", "payment", "apple pay", "credit card", "debit", "card types", "installments", "instalments", "pay in 4", "pay later", "split payment", "gift card", "afterpay", "klarna", "paypal"],
      beats: [
        {
          trace: [
            ["understand", "Payment options", "Apple Pay · paying in parts"],
            ["check", "Checkout settings", "Major cards · Apple Pay · pay in 4 · gift cards"],
            ["check", "Pay in 4 · $98", "4 × $24.50 every 2 weeks · no interest"],
            ["guard", "No card details here", "Payments only in the secure checkout"],
          ],
          say: "Yes to both. Checkout takes all major cards, Apple Pay and gift cards, or **pay in 4** of $24.50 every two weeks with no interest. Please don't type card details here, checkout handles that securely.",
        },
      ],
      next: ["payfail", "add", "ship"],
    },
    payfail: {
      ask: "My payment keeps failing at checkout.",
      chip: "My payment failed",
      keys: ["declined", "payment failed", "card declined", "won't go through", "wont go through", "failed", "error at checkout", "checkout error", "not working", "rejected", "charged twice", "double charged", "didnt go through", "payment didnt"],
      beats: [
        {
          trace: [
            ["understand", "Payment problem", "Checkout failing · tone: frustrated"],
            ["guard", "No card numbers", "Never ask for or accept card details in chat"],
            ["check", "Checkout log", "2 declines · 1:58, 2:01 AM · billing ZIP mismatch"],
            ["check", "Charges", "No charge taken · bag still saved"],
          ],
          say: "Sorry about that. Nothing was charged. Both tries were declined because the **billing ZIP didn't match** the card, so check it matches your bank's address. Apple Pay skips that step. Your bag is saved.",
          choices: [
            { label: "Talk to a person", go: "_human" },
            { label: "What can I pay with?", go: "payment" },
          ],
        },
      ],
      next: ["payment", "_human"],
    },
    account: {
      ask: "I forgot my password. Can you reset it for me?",
      chip: "I can't log in",
      keys: ["password", "forgot password", "reset password", "log in", "login", "sign in", "signin", "locked out", "account", "can't log", "username", "change email"],
      beats: [
        {
          trace: [
            ["understand", "Account access", "Forgot password"],
            ["guard", "No passwords in chat", "Never asks for, sees or sets a password"],
            ["act", "Reset link sent", "To the email on the account · expires in 30 min"],
            ["rule", "Guest checkout", "Bag and checkout work without signing in"],
          ],
          say: "I can't see or set passwords, and please don't send one here. I've emailed a **reset link** to the address on your account, it works for 30 minutes. You can also check out as a guest in the meantime.",
        },
      ],
      next: ["order", "add", "_human"],
    },
    order: {
      ask: "Where's my order? It's #48213.",
      chip: "Where's my order?",
      keys: ["where's my order", "wheres my order", "order status", "track", "tracking", "package", "parcel", "48213", "shipped yet", "has it shipped", "ups", "4471", "out for delivery"],
      beats: [
        {
          trace: [
            ["understand", "Order status", "Order #48213"],
            ["guard", "Identity check", "Signed in · email matches the order"],
            ["check", "Order lookup", "#48213 · 2 items · UPS …4471"],
            ["check", "Carrier scan", "Out for delivery · 7:02 AM, Austin hub"],
          ],
          say: "Found it. It's **out for delivery** and should be with you today by 6 PM.",
          card: { title: "Order #48213", pill: "Out for delivery", tone: "info", steps: { list: ["Ordered", "Shipped", "Out for delivery", "Delivered"], at: 2 }, rows: [["Arriving", "Today by 6 PM"], ["Carrier", "UPS …4471 · 2 items"]] },
        },
      ],
      next: ["address", "notreceived", "damaged"],
    },
    cancel: {
      ask: "Can I cancel the order I just placed?",
      chip: "Cancel my order",
      keys: ["cancel", "cancel order", "cancellation", "just placed", "just ordered", "ordered by mistake", "by accident", "undo", "stop the order", "don't want it", "48530"],
      beats: [
        {
          trace: [
            ["understand", "Cancel request", "Most recent order on the account"],
            ["check", "Order lookup", "#48530 · placed 1:51 AM · $98 · not packed"],
            ["rule", "1-hour window", "Under 1 hour → cancel here · after → care team"],
          ],
          say: "Yes, you can. Order **#48530** was placed 23 minutes ago and hasn't been packed, so it's still in the 1-hour window. Cancel it?",
        },
        { from: "user", say: "Yes, cancel it." },
        {
          trace: [
            ["act", "Order cancelled", "#48530 · stock released · confirmation emailed"],
            ["check", "Payment", "$98 authorization voided · not captured"],
            ["learn", "Reason", "Logged as 'changed mind' for the owner's report"],
          ],
          say: "Done, #48530 is cancelled. The $98 was only a hold, so it drops off your card in 1–3 days. After the first hour orders get packed, and then I'd hand it to the care team instead.",
          card: { title: "Order #48530", meta: "Cancelled 2:14 AM", pill: "Cancelled", tone: "ok", rows: [["Refund", "$98 hold released · 1–3 days"], ["Email", "Confirmation sent"]] },
        },
      ],
      next: ["add", "address", "_thanks"],
    },
    address: {
      ask: "I need to change the shipping address on #48213.",
      chip: "Change my address",
      keys: ["change address", "wrong address", "shipping address", "new address", "address change", "moved", "redirect", "reroute", "update address", "typo in address", "different street"],
      beats: [
        {
          trace: [
            ["understand", "Address change", "Order #48213 · already shipped"],
            ["guard", "Identity check", "Signed in · email matches the order"],
            ["check", "Carrier scan", "UPS …4471 · out for delivery · arriving today"],
            ["rule", "Shipped orders", "Address changes after dispatch → care team via UPS"],
          ],
          say: "That one's already on the truck, so I can't change it from here. I've sent it to the care team, they can ask UPS to redirect it or hold it at a pickup point. They'll message you **by 9 AM**, well before delivery.",
          card: { title: "Handed to a person", meta: "Ticket #2296 · #48213 address change", pill: "Reply by 9 AM", tone: "handoff" },
        },
      ],
      next: ["order", "cancel", "_human"],
    },
    intl: {
      ask: "Do you ship to Canada?",
      chip: "Do you ship abroad?",
      keys: ["canada", "international", "abroad", "overseas", "uk", "europe", "australia", "mexico", "outside the us", "worldwide", "other countries", "customs", "duties", "ship internationally", "ship to canada", "ship to uk", "germany", "france", "toronto", "london"],
      beats: [
        {
          trace: [
            ["understand", "International shipping", "Destination: Canada"],
            ["check", "Shipping zones", "US only · all 50 states + APO/FPO"],
            ["act", "Interest logged", "Canada · added to the international list"],
            ["learn", "Demand signal", "14 Canada asks this month · flagged for the owner"],
          ],
          say: "Not yet, sorry, we only ship within the US for now. If you know someone in the US, you can send it there as a gift. I've added you to the list for when we open Canada.",
        },
      ],
      next: ["gift", "ship", "restock"],
    },
    notreceived: {
      ask: "Tracking says delivered but I never got it.",
      chip: "Says delivered, not here",
      keys: ["delivered but", "never got", "never received", "not received", "didn't arrive", "didnt arrive", "missing package", "lost", "stolen", "porch", "marked delivered", "can't find", "no package"],
      beats: [
        {
          trace: [
            ["understand", "Missing parcel", "Marked delivered · not received · order #48107"],
            ["check", "Carrier scan", "Delivered Mon 2:41 PM · front door · photo on file"],
            ["rule", "Missing parcels → a person", "Care team checks UPS GPS and decides, never auto-reship"],
            ["act", "Ticket #2297", "Order, scan and chat sent to the care team"],
          ],
          say: "That's stressful, sorry. UPS marked it delivered Monday at 2:41 PM at the front door. It's worth a look with neighbours or a mailroom, but I've already sent it to the care team. They'll check the drop-off and sort it **by 9 AM**.",
          card: { title: "Handed to a person", meta: "Ticket #2297 · order #48107", pill: "Reply by 9 AM", tone: "handoff" },
        },
      ],
      next: ["order", "wrong", "_human"],
    },
    damaged: {
      ask: "My last order arrived torn at the seam.",
      chip: "My order arrived torn",
      keys: ["torn", "damaged", "broken", "ripped", "hole", "defect", "defective", "stain", "stained", "faulty", "seam", "came apart", "loose thread"],
      beats: [
        {
          trace: [
            ["understand", "Damaged item", "Tone: upset · order #47960"],
            ["rule", "Damage goes to a person", "Never auto-refund; a person decides"],
            ["act", "Asked for evidence", "A photo speeds up the team's decision"],
          ],
          say: "I'm really sorry, that shouldn't happen. Could you send a photo of the tear? I'll pass it straight to the team.",
          choices: [{ label: "Send a photo", go: "photo" }],
        },
      ],
      next: ["photo", "wrong"],
    },
    photo: {
      ask: "Here's the photo. IMG_2041.jpg",
      chip: "Send a photo",
      keys: ["photo", "picture", "pic", "image", "attached", "here it is", "screenshot", "jpg", "img_2041", "uploaded"],
      beats: [
        {
          trace: [
            ["check", "Photo received", "IMG_2041.jpg · added to the ticket"],
            ["act", "Ticket #2291", "Order #47960, photo and chat sent to the care team"],
            ["person", "Care team notified", "Reply promised by 9 AM"],
          ],
          say: "Thank you. A person on our care team has your photo and order, and will sort a replacement or refund by 9 AM.",
          card: { title: "Handed to a person", meta: "Ticket #2291 · photo attached", pill: "Reply by 9 AM", tone: "handoff" },
        },
        { from: "event", say: "Next morning · 8:12 AM", wait: 900 },
        {
          from: "person",
          who: "Mia · Care team",
          trace: [
            ["person", "A person took over", "Mia reviewed ticket #2291 and the photo"],
            ["person", "Replacement approved", "Free replacement · no return needed"],
          ],
          say: "Morning! So sorry about the seam. A new one in your size ships today, no need to send the torn one back.",
        },
      ],
      next: ["order", "size"],
    },
    wrong: {
      ask: "I ordered Oat in medium and got a Sage large.",
      chip: "I got the wrong item",
      keys: ["wrong item", "wrong size", "wrong colour", "wrong color", "not what i ordered", "different item", "mixed up", "sent the wrong", "got a sage", "incorrect", "mistake in my order", "48155"],
      beats: [
        {
          trace: [
            ["understand", "Wrong item", "Ordered Oat M · received Sage L · order #48155"],
            ["check", "Warehouse pick log", "#48155 picked from Sage L bin · our mistake"],
            ["rule", "Our mistake", "Wrong item → free swap now, no waiting for the return"],
            ["check", "Stock · Oat M", "3 left · 1 reserved for this swap"],
          ],
          say: "That's on us, sorry. I've reserved the **Oat in M** for you and it ships today before the 3 PM cut-off. A prepaid label for the Sage is in your email, send it back whenever in the next 30 days.",
          card: { title: "Swap · order #48155", rows: [["Sending", "Camp Collar Shirt · Oat · M"], ["Ships", "Today"], ["Send back", "Sage L · prepaid label emailed"], ["Cost", "Free"]], pill: "On its way", tone: "ok" },
        },
      ],
      next: ["order", "refundstatus", "_human"],
    },
    returns: {
      ask: "What if it doesn't fit?",
      chip: "What if it doesn't fit?",
      keys: ["return policy", "returns", "doesn't fit", "dont fit", "doesnt fit", "30 days", "how long to return", "can i return", "exchange policy", "free exchange", "final sale"],
      beats: [
        {
          trace: [
            ["check", "Returns policy", "30 days · unworn with tags · free exchanges"],
            ["rule", "Offer the exchange first", "Fit issues → suggest swapping size before refund"],
            ["check", "Refund label", "$6 return label taken from refunds · exchanges free"],
          ],
          say: "You have 30 days. Exchanges are free, so if it's off we'll send the other size and email you a prepaid label for this one. For a refund instead, a $6 label comes off the total.",
        },
      ],
      next: ["startreturn", "add", "discount"],
    },
    startreturn: {
      ask: "I want to return the Indigo shirt from my last order.",
      chip: "Start a return",
      keys: ["start a return", "return it", "return this", "send back", "send it back", "return label", "return an item", "make a return", "47731", "returning"],
      beats: [
        {
          trace: [
            ["understand", "Return request", "Indigo Camp Collar Shirt · L · order #47731"],
            ["guard", "Identity check", "Signed in · email matches the order"],
            ["check", "Return window", "Delivered 8 days ago · 22 days left · unworn"],
            ["rule", "Offer the exchange first", "Ask: exchange or refund, before making a label"],
          ],
          say: "Sure. Order **#47731** is well inside the 30 days. Would you like a different size, or your money back?",
          choices: [
            { label: "Exchange for a medium", go: "exchange" },
            { label: "Refund to my card", go: "refund" },
          ],
        },
      ],
      next: ["exchange", "refund"],
    },
    exchange: {
      ask: "Exchange it for a medium, please.",
      chip: "Exchange for a medium",
      keys: ["exchange", "swap", "swap it", "different size", "exchange for", "trade it", "replace with", "size swap", "exchange it", "exchange the"],
      beats: [
        {
          trace: [
            ["understand", "Exchange", "Indigo L → Indigo M · order #47731"],
            ["check", "Stock · Indigo M", "7 left · 1 reserved for this exchange"],
            ["act", "Exchange #R-1209", "Indigo M ships today · prepaid label emailed"],
            ["rule", "Exchanges are free", "No label fee, no price difference, same item"],
          ],
          say: "Done. The **Indigo in M** ships today, and a free prepaid label for the large is in your email. Drop it at any UPS point within 14 days.",
          card: { title: "Exchange #R-1209", rows: [["Sending", "Indigo · M"], ["Return", "Indigo · L · label emailed"], ["Cost", "Free"]], pill: "Ships today", tone: "ok", steps: { list: ["Requested", "New size shipped", "Old one received", "Done"], at: 1 } },
        },
      ],
      next: ["order", "refundstatus", "_thanks"],
    },
    refund: {
      ask: "I'd rather have a refund.",
      chip: "Refund to my card",
      keys: ["a refund", "want a refund", "refund instead", "refund me", "money back", "get my money", "reimburse", "full refund", "refund to my card", "credit back", "store credit", "refund please"],
      beats: [
        {
          trace: [
            ["understand", "Refund", "Indigo L · order #47731 · original card"],
            ["check", "Refund amount", "$98 − $6 return label = $92"],
            ["act", "Return #R-1209", "Prepaid label emailed · refund on arrival"],
            ["rule", "Timing", "Refund issued when it reaches the warehouse"],
          ],
          say: "All set. Your prepaid label is in your email. Once it reaches us, **$92** goes back to your card ($98 less the $6 label), usually 3–5 business days after that. An exchange would have been free, if you change your mind.",
          card: { title: "Return #R-1209", rows: [["Item", "Indigo · L"], ["Refund", "$92 to original card"], ["Label", "Emailed · $6 deducted"]], pill: "Label sent", tone: "ok", steps: { list: ["Requested", "Shipped back", "Received", "Refunded"], at: 0 } },
        },
      ],
      next: ["refundstatus", "exchange", "_thanks"],
    },
    refundstatus: {
      ask: "Where's my refund? I sent the return last week.",
      chip: "Where's my refund?",
      keys: ["where's my refund", "wheres my refund", "refund status", "haven't got my refund", "still no refund", "refund yet", "when will i get", "return received", "r-1182", "1182", "refund taking"],
      beats: [
        {
          trace: [
            ["understand", "Refund status", "Return sent last week"],
            ["guard", "Identity check", "Signed in · email matches return #R-1182"],
            ["check", "Return #R-1182", "Received Fri · refund $92 issued Mon to card"],
            ["check", "Bank timing", "Card refunds post in 3–5 business days"],
          ],
          say: "Good news, it's on its way. We got your return Friday and refunded **$92** on Monday. Banks take 3–5 business days to show it, so it should appear by Friday. If it doesn't, the care team will chase it.",
          card: { title: "Return #R-1182", pill: "Refunded", tone: "ok", steps: { list: ["Requested", "Shipped back", "Received", "Refunded"], at: 3 }, rows: [["Amount", "$92 to original card"], ["Expect it by", "Friday"]] },
        },
      ],
      next: ["startreturn", "order", "_human"],
    },
    wholesale: {
      ask: "Could I order 40 of these for my café staff?",
      chip: "Bulk or wholesale order",
      keys: ["wholesale", "bulk", "bulk order", "40 shirts", "uniform", "uniforms", "staff", "my team", "corporate", "large order", "stockist", "resell", "boutique", "trade price", "quantity"],
      beats: [
        {
          trace: [
            ["understand", "Bulk order", "40 shirts · café staff uniforms"],
            ["rule", "12+ units → wholesale", "Bulk pricing and timing set by a person"],
            ["check", "Stock · Oat", "XS 6 · S 11 · M 3 · L 9 · XL 4 → can't cover 40 from stock"],
            ["act", "Brief sent", "Qty 40 · uniforms · Oat preferred · to Theo"],
          ],
          say: "Lovely idea. Orders of 12 or more go to our wholesale lead, Theo, who sets bulk pricing and timing. Stock alone won't cover 40, so he'll check a production run. He'll reply **by 9 AM**.",
          card: { title: "Handed to a person", meta: "Wholesale · 40 shirts · Oat", pill: "Reply by 9 AM", tone: "handoff" },
        },
        { from: "event", say: "Next morning · 8:40 AM", wait: 900 },
        {
          from: "person",
          who: "Theo · Wholesale",
          trace: [["person", "A person took over", "Theo replied with bulk options for 40"]],
          say: "Hi! For 40 we can do a production run in about 3 weeks at a bulk rate. What size split do you need? I'll send a quote today.",
        },
      ],
      next: ["colours", "fabric", "_human"],
    },
  },
  fallback: {
    beats: [
      {
        trace: [
          ["understand", "No confident match", "Not sizing, stock, shipping, returns or an order"],
          ["guard", "Don't guess", "Unclear questions go to a person, not a made-up answer"],
          ["act", "Sent to the inbox", "Team replies by 9 AM"],
        ],
        say: "I'm not sure about that one, and I'd rather not guess. I've sent it to the team and they'll reply by 9 AM. Anything on sizing, stock, shipping or an order I can help with now?",
      },
    ],
  },
  capped: {
    beats: [
      {
        trace: [
          ["guard", "Monthly cap reached", "$40 of $40 used → assistant paused"],
          ["act", "Routed to the inbox", "Message saved for the team"],
          ["person", "A person replies", "By 9 AM, same thread"],
        ],
        from: "event",
        say: "Assistant paused · a person will reply here by 9 AM",
      },
    ],
  },
});

(window.AI_CASES ||= []).push({
  id: "dental",
  site: "ai-dental-site.webp",
  domain: "www.brightwaterdental.com",
  tab: "Dental clinic",
  icon: "tooth",
  name: "Front desk assistant",
  status: "Online 24/7 · Sun 9:40 PM",
  accent: "#1f7a6d",
  who: "You're a patient messaging the clinic's website on a Sunday night.",
  pitch: "Answers questions, books open slots, sends reminders, and flags urgent pain to the desk. Synced to the clinic calendar.",
  plan: "On your Claude or Codex plan, or pay-as-you-go with a cap you set",
  budget: { spent: 12.8, cap: 25, per: 0.003 },
  brief: "An AI front desk for my dental clinic that answers questions, books open slots, sends reminders and flags urgent pain to my staff",
  team: "the front desk",
  replyBy: "first thing Monday",
  greeting: [
    { say: "Hi, the clinic is closed tonight, but I can book a visit, answer questions on prices or insurance, or get an urgent message to the front desk. How can I help?" },
  ],
  start: ["clean", "pain", "price", "insurance"],
  menu: ["newpt", "kids", "whiten", "aligner", "implant", "anxiety", "plan", "cancel", "late", "waitlist", "chipped", "records"],
  topics: {
    clean: {
      ask: "Can I get a cleaning sometime this week?",
      chip: "Book a cleaning this week",
      keys: ["cleaning", "clean", "book", "booking", "book an appointment", "make an appointment", "appt", "this week", "check up", "checkup", "hygiene", "scale", "scale and polish", "polish", "schedule", "slot", "availability", "teeth cleaned", "routine visit", "six month"],
      beats: [
        {
          trace: [
            ["understand", "Booking request", "Cleaning · this week · no time given"],
            ["check", "Calendar · Dr. R", "Tue 10:30, Thu 3:00, Fri 9:00 open · 45-min gaps"],
            ["check", "Price list · Cleaning", "45 min · from $95"],
            ["rule", "Offer real slots only", "Show what's open, soonest first, never double-book"],
          ],
          say: "Yes. Dr. R has three openings this week for a cleaning (45 min, **from $95**). Which one suits you?",
          choices: [
            { label: "Tue 10:30", go: "tue" },
            { label: "Thu 3:00", go: "thu" },
            { label: "Fri 9:00", go: "fri" },
          ],
        },
      ],
      next: ["waitlist", "insurance", "kids"],
    },
    tue: {
      ask: "Tue 10:30 please.",
      chip: "Tue 10:30",
      keys: ["tue", "tues", "tuesday", "10:30", "1030", "10.30", "tuesday morning", "half ten", "tue 10:30", "tuesday at 10:30"],
      beats: [
        {
          trace: [
            ["understand", "Slot chosen", "Tue 10:30 · Cleaning · Dr. R"],
            ["act", "Slot held", "Kept for 10 min while details come in"],
            ["guard", "Only what's needed", "Name and mobile, nothing else for now"],
          ],
          say: "Good choice. I'm holding **Tue 10:30** for you. What name and mobile number should I book it under?",
        },
        { from: "user", say: "Sam, 555-0142" },
        {
          trace: [
            ["check", "Patient file", "No match for 555-0142 → new patient"],
            ["act", "Added to clinic calendar", "Synced · Dr. R · Tue 10:30–11:15"],
            ["act", "Reminder queued", "SMS to 555-0142 · Mon 6:00 PM"],
            ["rule", "New patients", "Intake form by SMS before the first visit"],
          ],
          say: "You're booked, Sam. I'll text you a reminder Monday evening, and since it's your first visit, a short form to fill in before you come.",
          card: { title: "Booked · Tue 10:30 · Cleaning", meta: "Dr. R · 45 min · from $95", pill: "Confirmed", tone: "ok", rows: [["Reminder", "SMS · Mon 6:00 PM"], ["Calendar", "Added · Synced"], ["New patient form", "Sent by SMS"]] },
        },
      ],
      next: ["newpt", "insurance", "hours"],
    },
    thu: {
      ask: "Thu 3:00 works.",
      chip: "Thu 3:00",
      keys: ["thu", "thur", "thurs", "thursday", "3:00", "3pm", "3 pm", "thursday afternoon", "thu 3:00", "thursday at 3"],
      beats: [
        {
          trace: [
            ["understand", "Slot chosen", "Thu 3:00 · Cleaning · Dr. R"],
            ["act", "Slot held", "Kept for 10 min while details come in"],
            ["guard", "Only what's needed", "Name and mobile, nothing else for now"],
          ],
          say: "Great. I'm holding **Thu 3:00** for you. What name and mobile number is it under?",
        },
        { from: "user", say: "Jordan, 555-0119" },
        {
          trace: [
            ["check", "Patient file", "Jordan · returning · last cleaning in March"],
            ["act", "Added to clinic calendar", "Synced · Dr. R · Thu 3:00–3:45"],
            ["act", "Reminder queued", "SMS to 555-0119 · Wed 6:00 PM"],
            ["learn", "Prefers afternoons", "Offer PM slots first next time"],
          ],
          say: "Welcome back, Jordan, you're booked. Your file is up to date, so no forms this time. I'll text you a reminder Wednesday evening.",
          card: { title: "Booked · Thu 3:00 · Cleaning", meta: "Dr. R · 45 min · from $95", pill: "Confirmed", tone: "ok", rows: [["Reminder", "SMS · Wed 6:00 PM"], ["Calendar", "Added · Synced"], ["Patient", "Returning · file up to date"]] },
        },
      ],
      next: ["resched", "cancel", "whiten"],
    },
    fri: {
      ask: "Fri 9:00 please.",
      chip: "Fri 9:00",
      keys: ["fri", "friday", "9:00", "9am", "9 am", "nine", "friday morning", "first thing friday", "fri 9:00", "friday at 9"],
      beats: [
        {
          trace: [
            ["understand", "Slot chosen", "Fri 9:00 · Cleaning · Dr. R"],
            ["act", "Slot held", "Kept for 10 min while details come in"],
            ["guard", "Only what's needed", "Name and mobile, nothing else for now"],
          ],
          say: "Sure. I'm holding **Fri 9:00** for you. What name and mobile number should I use?",
        },
        { from: "user", say: "Alex, 555-0173" },
        {
          trace: [
            ["check", "Patient file", "Alex · returning · PPO card on file"],
            ["act", "Added to clinic calendar", "Synced · Dr. R · Fri 9:00–9:45"],
            ["act", "Reminder queued", "SMS to 555-0173 · Thu 6:00 PM"],
            ["rule", "Insurance on file", "Desk re-checks benefits before every visit"],
          ],
          say: "You're booked, Alex. Your insurance is already on file, and the desk will re-check your benefits before Friday. Reminder text comes Thursday evening.",
          card: { title: "Booked · Fri 9:00 · Cleaning", meta: "Dr. R · 45 min · from $95", pill: "Confirmed", tone: "ok", rows: [["Reminder", "SMS · Thu 6:00 PM"], ["Calendar", "Added · Synced"], ["Insurance", "On file · desk re-checks"]] },
        },
      ],
      next: ["late", "resched", "hours"],
    },
    resched: {
      ask: "I need to move my appointment on Wednesday.",
      chip: "Move my appointment",
      keys: ["reschedule", "resched", "move", "change", "push back", "another day", "different time", "postpone", "move my appointment", "change my appointment", "new time", "switch days", "bring forward", "earlier time"],
      beats: [
        {
          trace: [
            ["understand", "Change request", "Existing appointment · Wednesday"],
            ["guard", "Identity check first", "Mobile on file + date of birth before any details"],
          ],
          say: "Of course. So I only share your details with you, what's the mobile number on your file, and your date of birth?",
        },
        { from: "user", say: "555-0156, 14 June 1991" },
        {
          trace: [
            ["guard", "Identity confirmed", "Mobile + date of birth match the file"],
            ["check", "Appointment", "Riley · Wed 4:15 PM · Check-up · Dr. R"],
            ["rule", "Change policy", "Free to move or cancel up to 24h before"],
            ["check", "Calendar · Dr. R · 30 min", "Thu 6:30 PM, Sat 11:00 AM open"],
          ],
          say: "Thanks, Riley, found you. Your check-up is **Wed 4:15 PM** with Dr. R, and it's free to move up to 24 hours before. I can do Thu 6:30 PM or Sat 11:00 AM, or cancel it if you'd rather.",
        },
        { from: "user", say: "Thursday evening, 6:30." },
        {
          trace: [
            ["act", "Moved", "Wed 4:15 PM → Thu 6:30 PM · no fee"],
            ["act", "Clinic calendar", "Synced · Wednesday slot released to the waitlist"],
            ["act", "Reminder updated", "SMS to 555-0156 · Wed 6:00 PM"],
          ],
          say: "Done. You're now on **Thu 6:30 PM**, and Wednesday's slot goes to someone on the waitlist. Your reminder text moves to Wednesday evening.",
          card: { title: "Moved · Thu 6:30 PM · Check-up", meta: "Dr. R · was Wed 4:15 PM", pill: "Updated", tone: "ok", rows: [["Reminder", "SMS · Wed 6:00 PM"], ["Calendar", "Synced"], ["Fee", "None · over 24h notice"]] },
        },
      ],
      next: ["late", "cancel", "hours"],
    },
    cancel: {
      ask: "I need to cancel my appointment on Friday.",
      chip: "Cancel an appointment",
      keys: ["cancel", "cancellation", "cancel my appointment", "cancelling", "can't make", "cant make", "call off", "won't make it", "wont make it", "not coming", "drop my appointment", "don't need it anymore"],
      beats: [
        {
          trace: [
            ["understand", "Cancel request", "Existing appointment · Friday"],
            ["guard", "Identity check first", "Mobile on file + date of birth before any details"],
          ],
          say: "No problem. First, what's the mobile number on your file, and your date of birth?",
        },
        { from: "user", say: "555-0125, 2 February 1984" },
        {
          trace: [
            ["guard", "Identity confirmed", "Mobile + date of birth match the file"],
            ["check", "Appointment", "Morgan · Fri 1:30 PM · Filling · Dr. R"],
            ["rule", "Cancel policy", "Free over 24h before · under 24h → $50 fee"],
            ["act", "Cancelled", "Fri 1:30 PM released · waitlist texted"],
          ],
          say: "All done, Morgan. Your filling on **Fri 1:30 PM** is cancelled, and since that's well over 24 hours away there's no fee. That tooth still needs looking after, so do you want to pick a new time now, or should I put you on the waitlist?",
          card: { title: "Cancelled · Fri 1:30 PM · Filling", meta: "Dr. R · no fee", pill: "Cancelled", tone: "warn", rows: [["Notice given", "Over 24h · free"], ["Slot", "Released to the waitlist"], ["Reminder", "Removed"]] },
          choices: [
            { label: "Pick a new time", go: "resched" },
            { label: "Put me on the waitlist", go: "waitlist" },
          ],
        },
      ],
      next: ["resched", "waitlist", "missed"],
    },
    late: {
      ask: "I'm going to be about 20 minutes late for my 11:00 tomorrow.",
      chip: "I'm running late",
      keys: ["late", "running late", "be late", "stuck in traffic", "traffic", "delayed", "few minutes", "10 minutes", "15 minutes", "20 minutes", "on my way", "behind schedule", "bus is late"],
      beats: [
        {
          trace: [
            ["understand", "Running late", "Tomorrow 11:00 · about 20 min"],
            ["guard", "Identity check first", "Name + date of birth before any details"],
          ],
          say: "Thanks for the heads-up. What name is the booking under, and your date of birth?",
        },
        { from: "user", say: "Taylor, 3 March 1988" },
        {
          trace: [
            ["check", "Appointment", "Taylor · Mon 11:00 AM · Check-up · next patient 11:30"],
            ["rule", "Late arrivals", "Up to 10 min → seen as normal · more → desk decides"],
            ["guard", "Won't promise the slot", "20 min late on a 30-min visit is the desk's call"],
            ["act", "Note pinned for the desk", "On screen when they open · Mon 8:00 AM"],
          ],
          say: "Got you, Taylor. Up to 10 minutes late is fine, but 20 minutes on a 30-minute check-up is the front desk's call, so I won't promise it. I've pinned a note for them, and they'll message you here first thing.",
        },
        { from: "event", say: "Next morning · Mon 8:06 AM", wait: 900 },
        {
          from: "person",
          who: "Dana · Front desk",
          trace: [
            ["person", "Desk took over", "Dana read the note · checked with Dr. R"],
            ["check", "Calendar · Dr. R", "11:20 shortened check-up OK · Tue 7:00 PM open"],
          ],
          say: "Morning Taylor, it's Dana. Dr. R can still see you at **11:20** for a slightly shorter check-up, or I can move you to Tue 7:00 PM if that's easier. Just reply here.",
          card: { title: "Late arrival · Mon 11:00 AM", meta: "Dr. R · decided by the front desk", pill: "Come at 11:20", tone: "handoff" },
        },
      ],
      next: ["missed", "resched", "hours"],
    },
    missed: {
      ask: "I missed my appointment on Friday. Can I rebook?",
      chip: "I missed my appointment",
      keys: ["missed", "miss", "forgot", "no show", "no-show", "didn't show", "slept through", "missed appointment", "missed my", "late cancel", "no show fee", "fee for missing", "totally forgot"],
      beats: [
        {
          trace: [
            ["understand", "Missed visit", "Friday · wants to rebook · tone: sheepish"],
            ["guard", "Identity check first", "Mobile on file + date of birth before any details"],
          ],
          say: "It happens. Let's get you back in. What's the mobile on your file and your date of birth?",
        },
        { from: "user", say: "555-0108, 21 October 1995" },
        {
          trace: [
            ["check", "Patient file", "Casey · missed Fri 2:00 PM cleaning · first miss on file"],
            ["rule", "Missed-visit policy", "$50 fee · waived once for a first miss"],
            ["guard", "No other waivers", "Second miss or disputes → front desk decides"],
            ["check", "Calendar · Dr. R", "Thu 6:30 PM, Sat 11:00 AM open"],
          ],
          say: "Thanks, Casey. Missed or late-cancelled visits are normally **$50**, but it's your first one, so it's waived. I can get you in Thu 6:30 PM or Sat 11:00 AM.",
        },
        { from: "user", say: "Sat 11 please." },
        {
          trace: [
            ["act", "Rebooked", "Casey · Sat 11:00 AM · Cleaning · Dr. R · synced"],
            ["act", "Reminders queued", "SMS Fri 6:00 PM + Sat 8:00 AM"],
            ["learn", "Missed once", "Send a second morning-of reminder from now on"],
          ],
          say: "You're in for **Sat 11:00 AM**, no fee. I'll text you Friday evening and again Saturday morning, just in case.",
          card: { title: "Rebooked · Sat 11:00 AM · Cleaning", meta: "Dr. R · from $95", pill: "Confirmed", tone: "ok", rows: [["Missed-visit fee", "$50 · waived, first time"], ["Reminders", "Fri 6:00 PM · Sat 8:00 AM"]] },
        },
      ],
      next: ["waitlist", "cancel", "late"],
    },
    waitlist: {
      ask: "Do you have anything sooner? I can only really do Wednesdays.",
      chip: "Anything sooner?",
      keys: ["waitlist", "wait list", "waiting list", "fully booked", "booked up", "nothing available", "sooner", "earlier slot", "any openings", "cancellation list", "notify me", "text me if", "this wednesday", "only wednesdays"],
      beats: [
        {
          trace: [
            ["understand", "Wants a sooner slot", "Wednesdays only"],
            ["check", "Calendar · Wed", "Fully booked · 0 open · 3 on the waitlist"],
            ["rule", "Fully booked", "Offer the waitlist + nearest real slot, never squeeze in"],
            ["check", "Nearest opening", "Thu 6:30 PM"],
          ],
          say: "This Wednesday is fully booked, I'm afraid. The nearest opening is Thu 6:30 PM. Or I can put you on the waitlist, and if a Wednesday slot frees up you'll get a text, first to reply gets it.",
        },
        { from: "user", say: "Waitlist please. Avery, 555-0164." },
        {
          trace: [
            ["act", "Added to waitlist", "Avery · 555-0164 · Wed, any time"],
            ["rule", "Waitlist texts", "Sent in order · slot held 30 min for a reply"],
            ["guard", "Only what's needed", "Name and mobile, nothing else"],
          ],
          say: "You're on it, Avery. If anything opens on Wednesday I'll text you straight away.",
          card: { title: "Waitlist · Wednesdays", meta: "Text as soon as a slot opens", pill: "Waiting", tone: "info", rows: [["Mobile", "555-0164"], ["Hold time", "30 min to reply"]] },
        },
        { from: "event", say: "Tue 4:12 PM · a cancellation comes in", wait: 900 },
        {
          trace: [
            ["check", "Calendar · Wed", "2:15 PM freed by a cancellation"],
            ["act", "Waitlist texted", "SMS to 555-0164 · slot held until 4:42 PM"],
          ],
          say: "Hi Avery, a **Wed 2:15 PM** slot just opened with Dr. R. Reply YES and it's yours. I'll hold it for 30 minutes.",
        },
        { from: "user", say: "YES" },
        {
          trace: [
            ["act", "Booked", "Avery · Wed 2:15 PM · Dr. R · synced"],
            ["act", "Reminder queued", "SMS to 555-0164 · Tue 6:00 PM"],
          ],
          say: "Done, you're in for **Wed 2:15 PM**. Reminder tonight at 6.",
          card: { title: "Booked · Wed 2:15 PM", meta: "Dr. R · from the waitlist", pill: "Confirmed", tone: "ok" },
        },
      ],
      next: ["hours", "cancel", "clean"],
    },
    price: {
      ask: "How much is a cleaning? And a filling?",
      chip: "How much is a cleaning?",
      keys: ["price", "prices", "cost", "costs", "how much", "fee", "fees", "quote", "pricing", "expensive", "cheap", "price list", "rates", "charge", "a filling", "fillings", "how much is a cleaning", "cavity", "cavities", "crown", "crowns", "extraction", "pull a tooth"],
      beats: [
        {
          trace: [
            ["understand", "Price question", "Cleaning + filling"],
            ["check", "Price list", "Cleaning from $95 · filling $150–$280 · crown $1,100–$1,300"],
            ["rule", "Ranges only", "Final quote after the exam, before any work starts"],
          ],
          say: "A cleaning is **from $95** for 45 minutes. A tooth-coloured filling is $150–$280 depending on size. Dr. R gives you the exact price after the exam, before anything starts, so there are no surprises.",
          card: { title: "Price list", meta: "Ranges · final quote after the exam", tone: "info", rows: [["Cleaning · 45 min", "from $95"], ["New-patient exam + X-rays", "$85"], ["Filling · per tooth", "$150–$280"], ["Root canal", "$900–$1,400"], ["Crown", "$1,100–$1,300"], ["Extraction · simple", "$180–$350"], ["Whitening", "$220 kit · $350–$450 chair"]] },
        },
      ],
      next: ["insurance", "plan", "rootcanal"],
    },
    whiten: {
      ask: "I want whiter teeth. What's the difference between the kit and doing it in the chair?",
      chip: "Teeth whitening",
      keys: ["whitening", "whiten", "white teeth", "teeth whitening", "bleach", "bleaching", "yellow teeth", "stains", "stained", "brighter", "take-home kit", "whitening kit", "coffee stains", "whiter"],
      beats: [
        {
          trace: [
            ["understand", "Whitening question", "Comparing kit vs in-chair"],
            ["check", "Price list · Whitening", "In the chair $350–$450 · take-home kit $220"],
            ["rule", "Check-up first", "Whitening only after a check-up in the last 6 months"],
            ["guard", "No result promises", "Shade change depends on the teeth, Dr. R advises"],
          ],
          say: "In the chair is one visit of about 90 minutes and the fastest result, **$350–$450**. The take-home kit is **$220**: custom trays and gel you wear for about two weeks. Either way, Dr. R needs a check-up from the last 6 months first, so cavities or sensitivity are spotted before whitening.",
          card: { title: "Whitening", meta: "Check-up in the last 6 months needed first", tone: "info", rows: [["In the chair · ~90 min", "$350–$450"], ["Take-home kit · ~2 weeks", "$220"], ["Final price", "After the check-up"]] },
          choices: [
            { label: "Book a check-up first", go: "clean" },
            { label: "Can I pay monthly?", go: "plan" },
          ],
        },
      ],
      next: ["clean", "aligner", "price"],
    },
    implant: {
      ask: "How much is an implant? I'm missing a back tooth.",
      chip: "Dental implants",
      keys: ["implant", "implants", "missing tooth", "replace a tooth", "lost a tooth", "false tooth", "bridge", "dentures", "denture", "titanium", "tooth replacement", "replace missing"],
      beats: [
        {
          trace: [
            ["understand", "Implant enquiry", "Missing back tooth · price first"],
            ["check", "Price list · Implants", "$3,200–$4,500 incl. crown · consult + 3D scan free"],
            ["rule", "Final quote after exam", "Bone and gum check decide the price, never quoted blind"],
            ["check", "Calendar · Dr. R · consult", "Tue 7:00 PM, Sat 11:00 AM open"],
          ],
          say: "A single implant with its crown is usually **$3,200–$4,500**. The exact figure depends on the bone and gums, so it starts with a free 30-minute consult and 3D scan. I can do Tue 7:00 PM or Sat 11:00 AM.",
        },
        { from: "user", say: "Tue 7 please. Priya, 555-0188." },
        {
          trace: [
            ["act", "Consult booked", "Priya · Tue 7:00 PM · Dr. R · synced"],
            ["act", "Reminder queued", "SMS to 555-0188 · Mon 6:00 PM"],
            ["rule", "Big treatment", "Written quote + plan options given at the consult"],
          ],
          say: "Booked, Priya. You'll leave the consult with a written quote, and if it helps, the payment plan options too.",
          card: { title: "Booked · Tue 7:00 PM · Implant consult", meta: "Dr. R · 30 min · free", pill: "Confirmed", tone: "ok", rows: [["3D scan", "Included"], ["Quote", "Written, at the consult"], ["Reminder", "SMS · Mon 6:00 PM"]] },
        },
      ],
      next: ["plan", "anxiety", "insurance"],
    },
    aligner: {
      ask: "Do you do Invisalign? My teeth are a bit crowded.",
      chip: "Clear aligners",
      keys: ["invisalign", "aligner", "aligners", "clear aligners", "braces", "straighten", "straight teeth", "crooked", "crowded", "overbite", "underbite", "orthodontic", "orthodontist", "retainer", "teeth straightening"],
      beats: [
        {
          trace: [
            ["understand", "Aligner enquiry", "Mild crowding · adult"],
            ["check", "Price list · Clear aligners", "$3,500–$5,800 · 6–18 months · consult free"],
            ["rule", "Final quote after exam", "Case length sets the price, decided at the scan"],
            ["check", "Calendar · Dr. R · consult", "Tue 7:00 PM, Sat 11:00 AM open"],
          ],
          say: "Yes, we do clear aligners. Most cases run **$3,500–$5,800** over 6 to 18 months, and mild crowding tends to sit at the shorter end. Dr. R confirms after a free scan consult. Tue 7:00 PM or Sat 11:00 AM?",
        },
        { from: "user", say: "Saturday at 11. Noor, 555-0127." },
        {
          trace: [
            ["act", "Consult booked", "Noor · Sat 11:00 AM · Dr. R · synced"],
            ["act", "Reminder queued", "SMS to 555-0127 · Fri 6:00 PM"],
            ["learn", "Interested in cosmetic", "Mention whitening after treatment, not before"],
          ],
          say: "Booked, Noor. Dr. R will scan your teeth and show you a preview of the result, and you'll get the quote in writing.",
          card: { title: "Booked · Sat 11:00 AM · Aligner consult", meta: "Dr. R · 30 min · free", pill: "Confirmed", tone: "ok", rows: [["Scan + preview", "Included"], ["Payment plan", "Up to 12 months"], ["Reminder", "SMS · Fri 6:00 PM"]] },
        },
      ],
      next: ["plan", "whiten", "implant"],
    },
    rootcanal: {
      ask: "Does a root canal hurt? And how long does it take?",
      chip: "Root canal questions",
      keys: ["root canal", "root canals", "nerve", "endodontic", "does it hurt", "dead tooth", "tooth infection", "pulp", "root treatment", "rct", "infected tooth"],
      beats: [
        {
          trace: [
            ["understand", "Root canal questions", "Comfort + time · tone: worried"],
            ["check", "Treatment notes", "60–90 min · 1–2 visits · crown often after"],
            ["check", "Price list", "Root canal $900–$1,400 · crown $1,100–$1,300"],
            ["guard", "No medical promises", "Numbing and comfort are Dr. R's to explain"],
          ],
          say: "It's done fully numbed, and most people say it feels like a long filling. It takes 60 to 90 minutes, sometimes over two visits, and is **$900–$1,400** depending on the tooth, often with a crown after. Dr. R will walk you through it and give the exact price after the exam.",
        },
      ],
      next: ["anxiety", "plan", "pain"],
    },
    wisdom: {
      ask: "Do you take out wisdom teeth?",
      chip: "Wisdom teeth",
      keys: ["wisdom", "wisdom teeth", "wisdom tooth", "impacted", "oral surgeon", "third molar", "pull my wisdom", "teeth out", "coming through", "back of my jaw"],
      beats: [
        {
          trace: [
            ["understand", "Wisdom teeth", "Removal question · no X-ray yet"],
            ["check", "Services", "Erupted wisdom teeth here · $250–$450 each"],
            ["rule", "Impacted teeth", "Referred to a partner oral surgeon, not done here"],
            ["rule", "X-ray first", "Exam + X-ray decides which, before any quote"],
          ],
          say: "Often, yes. If they've come through, Dr. R can take them out here, **$250–$450 each**. If they're stuck under the gum, we refer you to an oral surgeon we work with and send your X-rays over. An exam and X-ray tells you which, so that's the first step.",
          choices: [
            { label: "Book an exam", go: "newpt" },
            { label: "I'm nervous about it", go: "anxiety" },
          ],
        },
      ],
      next: ["newpt", "anxiety", "bleeding"],
    },
    insurance: {
      ask: "Do you take my insurance?",
      keys: ["insurance", "insured", "coverage", "cover", "covered", "in network", "in-network", "out of network", "ppo", "claim", "benefits", "insurence", "insurance card", "take my insurance", "my plan covers", "through work"],
      beats: [
        {
          trace: [
            ["understand", "Insurance question", "No plan named yet"],
            ["check", "In-network list", "18 PPO plans · no HMO · claims filed by the desk"],
            ["guard", "Won't guess", "Need the plan type before saying anything about cover"],
          ],
          say: "Happy to check. What kind of plan is it: a PPO, an HMO, or no insurance at the moment?",
        },
        { from: "user", say: "It's a PPO through work." },
        {
          trace: [
            ["check", "In-network list", "PPO → likely in-network · 18 plans accepted"],
            ["guard", "No coverage promises", "Benefits are confirmed by the desk, never guessed"],
            ["act", "Benefit check offered", "Card photo → desk verifies before the visit"],
          ],
          say: "Good news, we're in-network with 18 PPO plans and file the claim for you. I can't promise what your plan covers, so send a photo of your card when you book and the front desk checks your benefits before you come.",
          card: { title: "Insurance", meta: "Coverage confirmed before your visit", tone: "info", rows: [["In-network", "18 PPO plans"], ["HMO", "Not accepted"], ["Out-of-network", "Itemised receipt to claim"], ["Benefits check", "By the desk, before you come"]] },
          choices: [
            { label: "Mine's an HMO", go: "plan" },
            { label: "Book a cleaning", go: "clean" },
          ],
        },
      ],
      next: ["clean", "price", "plan"],
    },
    plan: {
      ask: "I don't have insurance. Can I pay monthly?",
      chip: "No insurance? Payment plans",
      keys: ["payment plan", "payment plans", "no insurance", "uninsured", "not insured", "finance", "financing", "monthly", "installments", "instalments", "pay over time", "afford", "can't afford", "membership", "hmo", "split the cost", "pay later"],
      beats: [
        {
          trace: [
            ["understand", "Paying without cover", "No insurance or an HMO we don't take"],
            ["check", "Membership plan", "$29/month · 2 cleanings, exams, X-rays · 15% off treatment"],
            ["check", "Payment plans", "Over $500 → 6 months 0% in-house · up to 12 via lender"],
            ["guard", "No credit decisions", "Lender approval is theirs, the chat can't approve or discount"],
          ],
          say: "Plenty of our patients pay without cover. The membership is **$29 a month** for two cleanings, exams and X-rays a year, plus 15% off any treatment. For anything over $500 you can split it over 6 months at 0%, or up to 12 months through our lending partner, who makes that approval, not me.",
          card: { title: "Paying without insurance", meta: "Same prices as everyone · no hidden fees", tone: "info", rows: [["Membership", "$29/month"], ["Includes", "2 cleanings, exams, X-rays"], ["Treatment", "15% off for members"], ["Over $500", "6 months 0% · or up to 12"]] },
          choices: [
            { label: "Book a cleaning", go: "clean" },
            { label: "Talk to a person", go: "_human" },
          ],
        },
      ],
      next: ["price", "implant", "aligner"],
    },
    pain: {
      ask: "I have really bad tooth pain and my cheek is swelling.",
      chip: "Severe tooth pain",
      keys: ["pain", "hurts", "hurting", "toothache", "tooth ache", "swelling", "swollen", "swelled", "emergency", "urgent", "throbbing", "abscess", "can't sleep", "agony", "sore tooth", "face is swollen"],
      beats: [
        {
          trace: [
            ["understand", "Urgent", "Severe pain + facial swelling · tone: distressed"],
            ["guard", "No medical advice", "Won't diagnose · breathing or swallowing → ER"],
            ["rule", "Severe pain or swelling", "Front desk, not just a booking"],
            ["act", "Flagged to the front desk", "Urgent · callback Mon 8:00 AM"],
          ],
          say: "I'm sorry, that sounds really painful. I've flagged this to the front desk as urgent, and they'll call you **first thing, 8:00 AM**. If the swelling is making it hard to breathe or swallow, call emergency services or go to the ER now. Don't wait for us.",
          card: { title: "Flagged to the front desk", meta: "Severe tooth pain reported · callback first thing", pill: "Callback Mon 8:00 AM", tone: "alert" },
        },
        { from: "event", say: "Next morning · Mon 7:58 AM", wait: 900 },
        {
          from: "person",
          who: "Dana · Front desk",
          trace: [
            ["person", "Desk picked up the flag", "Dana read the chat · calling at 8:00"],
            ["check", "Calendar · Urgent hold", "Mon 9:00 kept free for cases like this"],
          ],
          say: "Good morning, it's Dana at the front desk. I've read your message and I'm calling you in two minutes. Dr. R has kept **9:00 this morning** for you, so you can come straight in.",
          card: { title: "Booked · Mon 9:00 · Urgent visit", meta: "Dr. R · held by the front desk", pill: "Confirmed by Dana", tone: "handoff" },
        },
      ],
      next: ["meds", "chipped", "knocked"],
    },
    chipped: {
      ask: "I chipped my front tooth on a fork. It doesn't really hurt.",
      chip: "Chipped or broken tooth",
      keys: ["chipped", "chip", "chipped a tooth", "broken tooth", "broke my tooth", "broke a tooth", "cracked", "crack", "snapped", "piece fell off", "lost a filling", "filling fell out", "sharp edge", "bit something hard"],
      beats: [
        {
          trace: [
            ["understand", "Chipped tooth", "Front tooth · little pain · not an emergency"],
            ["rule", "Chips and breaks", "Seen within 1 business day · ER only for heavy bleeding"],
            ["check", "Calendar · Urgent hold", "Mon 12:30 PM free · Mon 9:00 already taken"],
            ["guard", "No fix promised yet", "Bonding $160–$320 is likely, Dr. R decides at the visit"],
          ],
          say: "Good that it doesn't hurt. It isn't an ER thing, but it should be seen soon. Dr. R has an urgent slot **Mon 12:30 PM**. A small chip is usually fixed with bonding, **$160–$320**, and you'll get the exact price before anything is done. Want it?",
        },
        { from: "user", say: "Yes please. Jamie, 555-0131." },
        {
          trace: [
            ["act", "Urgent visit booked", "Jamie · Mon 12:30 PM · Dr. R · synced"],
            ["act", "Desk notified", "Chip note on Dana's screen at 8:00 AM"],
            ["rule", "Pain changes things", "Severe pain or swelling before then → urgent flag"],
          ],
          say: "Booked, Jamie. If you still have the piece, bring it along. And if it starts to really hurt or swell before then, message me and I'll flag it as urgent.",
          card: { title: "Booked · Mon 12:30 PM · Chipped tooth", meta: "Dr. R · urgent slot", pill: "Confirmed", tone: "ok", rows: [["Bring", "The broken piece, if you have it"], ["Likely fix", "Bonding · $160–$320"], ["Front desk", "Notified"]] },
          choices: [{ label: "It's started hurting", go: "pain" }],
        },
      ],
      next: ["knocked", "pain", "price"],
    },
    knocked: {
      ask: "My son just knocked out his front tooth playing football!",
      chip: "Knocked-out tooth",
      keys: ["knocked out", "knocked", "tooth came out", "whole tooth", "punched", "hit in the mouth", "fell on his face", "fell on my face", "sports injury", "popped out", "tooth out", "avulsed"],
      beats: [
        {
          trace: [
            ["understand", "Dental emergency", "Knocked-out front tooth · child · minutes ago"],
            ["rule", "Knocked-out tooth", "Page the on-call dentist now · minutes matter"],
            ["check", "Emergency sheet", "Hold by the crown · don't scrub · keep in milk"],
            ["act", "On-call paged", "Dr. R · urgent · Sun 9:42 PM"],
          ],
          say: "Act fast, minutes matter. Pick the tooth up by the white part, not the root. If it's dirty, rinse it quickly in milk, don't scrub it, then **keep it in a cup of milk**. Bring him and the tooth in within the hour. I've just paged the on-call dentist. If he hit his head or is bleeding heavily, go to the ER.",
          card: { title: "On-call dentist paged", meta: "Knocked-out tooth · reply within 15 min", pill: "Paged 9:42 PM", tone: "alert", rows: [["Tooth", "In milk · hold by the crown"], ["Don't", "Scrub it or wrap it in tissue"], ["Head injury", "Go to the ER"]] },
        },
        { from: "event", say: "Sun 9:47 PM", wait: 700 },
        {
          from: "person",
          who: "Dr. R · On call",
          trace: [
            ["person", "On-call dentist took over", "Dr. R read the chat · heading in"],
            ["act", "Clinic opened after hours", "Emergency visit · Sun 10:15 PM"],
          ],
          say: "This is Dr. R. You did the right thing with the milk. Meet me at the clinic at **10:15 PM**, front door, and bring the tooth with you. I'll call you in a moment.",
          card: { title: "Emergency visit · Sun 10:15 PM", meta: "Dr. R · after hours", pill: "On the way", tone: "handoff" },
        },
      ],
      next: ["kids", "chipped", "bleeding"],
    },
    bleeding: {
      ask: "I had a tooth out yesterday and it's still bleeding.",
      chip: "Bleeding after extraction",
      keys: ["bleeding", "bleed", "blood", "still bleeding", "after extraction", "after surgery", "socket", "dry socket", "gauze", "won't stop bleeding", "oozing", "pulled yesterday"],
      beats: [
        {
          trace: [
            ["understand", "Bleeding after extraction", "About 30 hours since the visit"],
            ["guard", "No medical advice", "Only the clinic's own aftercare sheet, nothing more"],
            ["rule", "Bleeding after surgery", "Page the on-call dentist, don't wait for Monday"],
            ["act", "On-call paged", "Dr. R · call back within 15 min"],
          ],
          say: "Thanks for telling me straight away. Your aftercare sheet says to bite firmly on clean gauze for 30 minutes, and to avoid rinsing, spitting or straws. I've paged the on-call dentist, who'll phone you within 15 minutes. If it's soaking through gauze fast or you feel faint, go to the ER now.",
          card: { title: "On-call dentist paged", meta: "Bleeding after extraction", pill: "Call within 15 min", tone: "alert", rows: [["Aftercare sheet", "Firm gauze pressure · 30 min"], ["Avoid", "Rinsing, spitting, straws"], ["Heavy bleeding or faint", "Go to the ER"]] },
        },
        { from: "event", say: "Sun 9:51 PM", wait: 700 },
        {
          from: "person",
          who: "Dr. R · On call",
          trace: [
            ["person", "On-call dentist took over", "Dr. R calling now"],
            ["check", "Patient file", "Extraction Sat 11:30 AM · lower molar"],
          ],
          say: "Hi, it's Dr. R. I can see your extraction from Saturday. I'm calling you right now so we can talk it through.",
        },
      ],
      next: ["meds", "pain", "wisdom"],
    },
    meds: {
      ask: "Should I take antibiotics? I have some left from last year.",
      chip: "Should I take antibiotics?",
      keys: ["antibiotic", "antibiotics", "medicine", "medication", "meds", "pills", "painkiller", "painkillers", "prescription", "dose", "should i take", "leftover", "refill", "repeat prescription", "ibuprofen", "amoxicillin"],
      beats: [
        {
          trace: [
            ["understand", "Medical question", "Antibiotics · leftover from last year"],
            ["guard", "No medical advice", "Medicine and refills are the dentist's call only"],
            ["act", "Call requested", "Added to Dr. R's call list · Mon morning"],
            ["person", "Dentist notified", "Dr. R's team sees it before 9 AM"],
          ],
          say: "I can't give medical advice or refill prescriptions, and whether to take antibiotics is Dr. R's call. I've asked Dr. R's team to phone you tomorrow morning. If you have swelling or a fever, tell me now and I'll mark it urgent.",
          card: { title: "Call from the dentist", meta: "Dr. R's call list · antibiotics question", pill: "Mon morning", tone: "handoff" },
          choices: [{ label: "I have swelling", go: "pain" }],
        },
      ],
      next: ["pain", "pregnant", "clean"],
    },
    pregnant: {
      ask: "I'm five months pregnant. Is it OK to get a cleaning?",
      chip: "Dental care while pregnant",
      keys: ["pregnant", "im pregnant", "pregnancy", "expecting", "trimester", "breastfeeding", "nursing", "baby on the way", "weeks along", "morning sickness", "x-ray while pregnant", "due date"],
      beats: [
        {
          trace: [
            ["understand", "Pregnancy + dental care", "About 5 months · asking about a cleaning"],
            ["guard", "No medical advice", "What's safe in pregnancy is Dr. R's decision"],
            ["rule", "Pregnancy on file", "Dr. R reviews before any X-ray, medicine or treatment"],
            ["act", "Call requested", "Dr. R's call list · Mon morning"],
          ],
          say: "Congratulations. I can't tell you what's safe, that's for Dr. R, so I've added you to Dr. R's call list for tomorrow morning. Whenever you do come in, it's noted on your file, and Dr. R reviews it before any X-ray, medicine or treatment.",
          card: { title: "Call from the dentist", meta: "Pregnancy · about 5 months", pill: "Mon morning", tone: "handoff" },
          choices: [
            { label: "Book a cleaning anyway", go: "clean" },
            { label: "Talk to a person", go: "_human" },
          ],
        },
      ],
      next: ["meds", "anxiety", "clean"],
    },
    anxiety: {
      ask: "I'm really nervous about the dentist. Are you gentle?",
      chip: "I'm nervous about the dentist",
      keys: ["nervous", "anxious", "anxiety", "scared", "afraid", "fear", "phobia", "sedation", "sedated", "laughing gas", "nitrous", "put me to sleep", "gentle", "panic", "terrified", "reviews", "rating", "good dentist"],
      beats: [
        {
          trace: [
            ["understand", "Dental anxiety", "Tone: worried · wants reassurance"],
            ["check", "Reviews", "4.9 from 612 reviews · 140 mention \"gentle\""],
            ["check", "Comfort options", "Stop signal, breaks, headphones · laughing gas $75"],
            ["guard", "Stronger sedation", "Only after Dr. R reviews your health history"],
          ],
          say: "You're far from the only one, and it's fine to say so. We're rated 4.9 from 612 reviews, and gentle comes up a lot. You can raise a hand to stop at any time, take breaks, or wear headphones. Laughing gas is **$75** a visit, and anything stronger is something Dr. R talks through with you first.",
          choices: [
            { label: "Book a first visit", go: "newpt" },
            { label: "Talk to someone first", go: "_human" },
          ],
        },
      ],
      next: ["newpt", "rootcanal", "kids"],
    },
    newpt: {
      ask: "I'm a new patient. How does the first visit work, and what do I bring?",
      chip: "I'm a new patient",
      keys: ["new patient", "new here", "first time", "first visit", "register", "sign up", "never been", "switching dentist", "new to the clinic", "what to bring", "bring with me", "intake form", "paperwork", "haven't been in years", "joining"],
      beats: [
        {
          trace: [
            ["understand", "New patient", "First-visit steps + what to bring"],
            ["check", "Clinic policy", "New patients welcome · intake form by SMS"],
            ["check", "Price list", "Exam + X-rays $85 · cleaning from $95"],
            ["rule", "No judgement", "Years since last visit never stops a booking"],
          ],
          say: "Welcome. Your first visit is an exam and X-rays with Dr. R (**$85**) and a cleaning (**from $95**), all in one go. No judgement if it's been a while. Bring photo ID, your insurance card if you have one, and a list of any medicines. If you have X-rays from an old dentist, we can request them for you.",
          card: { title: "Your first visit", meta: "Exam, X-rays and cleaning in one visit", tone: "info", rows: [["Exam + X-rays", "$85"], ["Cleaning", "from $95"], ["Bring", "Photo ID, insurance card, medicines list"], ["Form", "By SMS after booking"]] },
          choices: [
            { label: "Book my first visit", go: "clean" },
            { label: "Do you take my insurance?", go: "insurance" },
          ],
        },
      ],
      next: ["clean", "anxiety", "records"],
    },
    kids: {
      ask: "Can I bring my 4-year-old? It'd be her first visit.",
      chip: "Do you see kids?",
      keys: ["kid", "kids", "child", "children", "son", "daughter", "toddler", "baby teeth", "family", "year old", "pediatric", "paediatric", "little one", "book us together", "same time as me", "whole family", "siblings"],
      beats: [
        {
          trace: [
            ["understand", "Child's first visit", "Age 4 · parent asking"],
            ["check", "Clinic policy", "Kids welcome from age 2 · new patients accepted"],
            ["rule", "First visits for kids", "30 min, gentle, clean only if she's happy"],
            ["check", "Calendar · Sat", "9:30 AM open · popular with families"],
          ],
          say: "Yes, kids are welcome from age 2. A first visit is a gentle 30 minutes: a ride in the chair, a count of her teeth, and a clean only if she's happy. Saturdays are popular for this, and **Sat 9:30** is open.",
        },
        { from: "user", say: "Great. Could I get my cleaning at the same time? I'm Jess, 555-0190, she's Ava." },
        {
          trace: [
            ["check", "Calendar · Kim, hygienist", "Sat 9:30 open in the next chair"],
            ["rule", "Families together", "Book side by side so no one waits alone"],
            ["act", "Both booked", "Ava · Dr. R · Jess · Kim · Sat 9:30 · synced"],
            ["act", "Reminder queued", "One SMS for both · Fri 6:00 PM"],
          ],
          say: "Done. You'll be side by side: Ava with Dr. R and you with Kim, our hygienist, both at **Sat 9:30**. One reminder text for both of you on Friday evening.",
          card: { title: "Booked · Sat 9:30 · Family visit", meta: "Two chairs side by side", pill: "Confirmed", tone: "ok", rows: [["Ava · first visit", "Dr. R · 30 min"], ["Jess · cleaning", "Kim · 45 min · from $95"], ["Reminder", "SMS · Fri 6:00 PM"]] },
        },
      ],
      next: ["knocked", "insurance", "hours"],
    },
    records: {
      ask: "I'm moving away. Can you send my records and X-rays to my new dentist?",
      chip: "Send my records",
      keys: ["records", "my records", "x-ray", "x-rays", "xray", "xrays", "transfer", "moving away", "new dentist", "copy of", "dental history", "send my files", "release form", "chart"],
      beats: [
        {
          trace: [
            ["understand", "Records transfer", "To a new dentist · includes X-rays"],
            ["guard", "Identity check first", "Records are private · mobile + date of birth"],
          ],
          say: "Of course. Records are private, so first: what's the mobile on your file and your date of birth?",
        },
        { from: "user", say: "555-0147, 9 May 1979" },
        {
          trace: [
            ["guard", "Identity confirmed", "Mobile + date of birth match the file"],
            ["check", "Patient file", "Robin · visits since 2019 · 14 X-rays"],
            ["rule", "Signed release", "Nothing leaves the clinic without the patient's signature"],
            ["act", "Release form sent", "SMS link to 555-0147 · sign on your phone"],
          ],
          say: "Thanks, Robin. I've texted you a release form to sign on your phone. Once it's signed, the front desk sends your full file and all 14 X-rays to your new dentist within 2 business days. There's no charge.",
          card: { title: "Records transfer", meta: "Robin · file + 14 X-rays", pill: "Waiting for signature", tone: "draft", steps: { list: ["Identity checked", "Release signed", "Sent by the desk"], at: 1 }, rows: [["Sent within", "2 business days"], ["Cost", "Free"]] },
        },
      ],
      next: ["newpt", "hours", "cancel"],
    },
    hours: {
      ask: "What are your hours? Is there parking?",
      chip: "Hours and parking",
      keys: ["hours", "open", "opening", "close", "closing", "saturday", "weekend", "evening", "evenings", "after work", "parking", "park", "address", "directions", "location", "wheelchair", "accessible", "accessibility", "languages", "speak", "interpreter", "translator", "mandarin", "vietnamese"],
      beats: [
        {
          trace: [
            ["understand", "Hours + getting here", "General clinic info"],
            ["check", "Opening hours", "Mon–Fri 8–6 · Tue & Thu until 8 PM · Sat 9–2"],
            ["check", "Location notes", "Free lot behind the building · step-free · lift"],
            ["check", "Staff languages", "Desk speaks Spanish, Mandarin, Vietnamese · phone interpreter"],
          ],
          say: "We're open weekdays 8 to 6, until 8 PM on Tuesdays and Thursdays, and Saturdays 9 to 2. Parking is free in the lot behind the building, with a step-free entrance and a lift. The front desk speaks Spanish, Mandarin and Vietnamese, and we can bring in a phone interpreter for other languages.",
          card: { title: "Clinic hours", meta: "4.9 from 612 reviews · new patients welcome", tone: "info", rows: [["Mon–Fri", "8:00 AM – 6:00 PM"], ["Tue & Thu", "until 8:00 PM"], ["Saturday", "9:00 AM – 2:00 PM"], ["Sunday", "Closed · urgent messages flagged"], ["Access", "Free parking · step-free · lift"]] },
        },
      ],
      next: ["clean", "kids", "late"],
    },
  },
  fallback: {
    beats: [
      {
        trace: [
          ["understand", "No confident match", "Not booking, treatment, prices, insurance or pain"],
          ["guard", "Don't guess", "Unclear questions go to a person, not a made-up answer"],
          ["act", "Sent to the front desk", "Reply Mon by 10 AM"],
        ],
        say: "I'm not sure about that one, and I'd rather not guess. I've sent it to the front desk and they'll reply Monday by 10 AM. If it's about pain, swelling or an injury, tell me and I'll mark it urgent.",
      },
    ],
  },
  capped: {
    beats: [
      {
        trace: [
          ["guard", "Monthly cap reached", "$25 of $25 used → assistant paused"],
          ["act", "Routed to the front desk", "Message saved in the desk inbox"],
          ["person", "A person replies", "Mon from 8:00 AM, same thread"],
        ],
        from: "event",
        say: "Assistant paused · the front desk will reply here Monday from 8 AM",
      },
    ],
  },
});

(window.AI_CASES ||= []).push({
  id: "realestate",
  site: "ai-realestate-site.webp",
  domain: "www.mapleandcorealty.com",
  tab: "Real estate",
  icon: "home",
  name: "Home team assistant",
  status: "Replies in under 60 sec · 8:47 PM",
  accent: "#1d6fe8",
  who: "You're a buyer who just tapped a listing ad, messaging an Austin agent team at 8:47 PM.",
  pitch: "Answers every lead in under a minute, qualifies them in conversation, books viewings into the agent's calendar and follows up until they reply.",
  plan: "On your Claude or Codex plan, or pay-as-you-go with a cap you set",
  budget: { spent: 18.6, cap: 50, per: 0.005 },
  brief: "An AI assistant for my real estate team that answers leads instantly, qualifies them and books viewings into our calendars",
  team: "Jordan, the listing agent",
  replyBy: "within the hour",
  greeting: [
    { say: "Hi! Thanks for tapping our listing. I can check a home, book a viewing, or answer questions about buying or selling with us. What caught your eye?" },
  ],
  start: ["listing", "hood", "offer", "sell"],
  menu: ["details", "photos", "similar", "firsttime", "inspection", "relocate", "makeoffer", "commission", "rent", "invest", "otheragent", "reschedule"],
  topics: {
    listing: {
      ask: "Is the 3-bed on Maple Ridge still available?",
      chip: "Is the Maple Ridge 3-bed available?",
      keys: ["available", "maple ridge", "maple", "3-bed", "3 bed", "three bed", "still for sale", "for sale", "listing", "how much is the house", "whats the price", "price", "asking price", "list price", "open house", "still available", "under contract", "pending", "sold yet", "on the market", "214"],
      beats: [
        {
          trace: [
            ["understand", "Listing question", "3-bed on Maple Ridge · came from listing ad"],
            ["check", "MLS lookup", "214 Maple Ridge Dr · Active · price unchanged"],
            ["check", "Listing details", "$485,000 · 3 bd / 2 ba · 1,840 sq ft · 12 days"],
            ["act", "Lead scored", "Intent 45 → 62 · ad click + named a specific home"],
          ],
          say: "Yes, it's still available. **$485,000**, 3 beds, 2 baths, and there's an open house Saturday 1–4 PM, no sign-up needed. Want a private viewing instead?",
          card: {
            title: "214 Maple Ridge Dr",
            meta: "Austin, TX · listed 12 days ago",
            pill: "Active",
            tone: "ok",
            rows: [["Price", "$485,000"], ["Beds / baths", "3 / 2 · 1,840 sq ft"], ["Open house", "Sat 1–4 PM · walk in"]],
            actions: [{ label: "Book a viewing", go: "book" }, { label: "See photos + 3D tour", go: "photos" }],
          },
        },
      ],
      next: ["book", "details", "similar", "hood"],
    },
    details: {
      ask: "What are the HOA fees and property taxes? Are pets allowed?",
      chip: "HOA, taxes and pets?",
      keys: ["hoa", "hoa fee", "property tax", "taxes", "tax bill", "year built", "how old", "lot size", "yard", "backyard", "garage", "parking", "pets", "pets allowed", "dogs", "cats", "square feet", "sq ft", "utilities", "age of the house", "fenced"],
      beats: [
        {
          trace: [
            ["understand", "Listing facts", "HOA, taxes, pets · 214 Maple Ridge Dr"],
            ["check", "MLS + county record", "Built 2006 · 0.19 ac lot · 2025 tax $9,840"],
            ["check", "HOA documents", "$45/mo · pets allowed · leash rule on trails"],
            ["guard", "No tax predictions", "Next year's bill is the county's call, not ours"],
          ],
          say: "HOA is **$45 a month**, and pets are welcome, with a leash rule on the shared trails. Last year's tax bill was **$9,840**. Your bill after buying depends on the county's reappraisal, so I won't guess that one.",
          card: {
            title: "214 Maple Ridge Dr · details",
            tone: "info",
            rows: [["Year built", "2006"], ["Lot", "0.19 acre · fenced backyard"], ["Parking", "2-car garage + driveway"], ["HOA", "$45 / month · pets allowed"], ["Property tax", "$9,840 (2025 bill)"], ["Size", "1,840 sq ft · 3 bd / 2 ba"]],
          },
        },
        {
          trace: [
            ["act", "Lead scored", "+5 · asked HOA and taxes, a serious-buyer signal"],
            ["act", "HOA docs attached", "Rules + budget PDF added to the lead's file"],
          ],
          say: "I've saved the HOA rules to your file so Jordan can hand you a copy at the viewing.",
        },
      ],
      next: ["book", "inspection", "photos", "invest"],
    },
    photos: {
      ask: "Are there more photos or a virtual tour?",
      chip: "Photos and 3D tour",
      keys: ["photos", "photo", "pictures", "pics", "images", "virtual tour", "3d tour", "3d", "floor plan", "floorplan", "interior", "kitchen", "inside", "more photos", "gallery", "layout"],
      beats: [
        {
          trace: [
            ["understand", "Wants to see inside", "Photos / virtual tour · before booking"],
            ["check", "Listing media", "34 photos · 3D tour · floor plan PDF"],
            ["act", "Links sent", "Gallery + 3D tour + floor plan by text"],
            ["learn", "Engagement tracked", "Opens of the 3D tour count toward intent"],
          ],
          say: "There are **34 photos**, a full 3D walkthrough and a floor plan. I've texted you all three. The kitchen and backyard shots are the ones most people ask about.",
          card: {
            title: "214 Maple Ridge Dr · media",
            tone: "info",
            rows: [["Photos", "34 · updated 12 days ago"], ["3D tour", "Every room, walk at your own pace"], ["Floor plan", "PDF · 1,840 sq ft"]],
            actions: [{ label: "Book a viewing", go: "book" }],
          },
        },
      ],
      next: ["book", "details", "relocate"],
    },
    similar: {
      ask: "What else do you have in my budget?",
      chip: "Similar homes in budget",
      keys: ["similar", "other homes", "other houses", "alternatives", "other options", "other listings", "anything else", "what else", "cheaper", "less expensive", "in my budget", "compare", "backup", "under 470"],
      beats: [
        {
          trace: [
            ["understand", "Wants alternatives", "Budget ~$500k · 3+ beds · near Maple Ridge"],
            ["guard", "Fair housing", "Match on price, beds, size, commute only"],
            ["check", "MLS search", "3+ bd · ≤ $500k · ≤ 30 min commute → 3 active"],
            ["act", "Lead scored", "+3 · open to alternatives, keep in active search"],
          ],
          say: "Here are three active homes on the same criteria: price, beds and commute. Want me to look at 4-bed options too?",
          card: {
            title: "3 similar homes",
            meta: "3+ beds · up to $500k · active today",
            tone: "info",
            rows: [["37 Quarry Oak Ln", "$459,900 · 3 / 2 · 1,690 sq ft"], ["9 Larkspur Ct", "$468,000 · 3 / 2 · 1,710 sq ft"], ["214 Maple Ridge Dr", "$485,000 · 3 / 2 · 1,840 sq ft"]],
          },
          choices: [
            { label: "Show 4-bed options", go: "similar4" },
            { label: "Stick with Maple Ridge", go: "book" },
          ],
        },
      ],
      next: ["similar4", "book", "listing"],
    },
    similar4: {
      ask: "Show me 4-bed options.",
      chip: "4-bed options",
      keys: ["4 bedroom", "4 beds", "4 bed", "four bedroom", "four bed", "fourth bedroom", "extra bedroom", "home office", "bigger house", "more bedrooms", "larger", "more space", "office space"],
      beats: [
        {
          trace: [
            ["understand", "Wants more space", "4+ beds · same $500k ceiling"],
            ["check", "MLS search", "4+ bd · ≤ $500k · ≤ 30 min → 2 active"],
            ["rule", "Show the trade-off", "Bigger at this price usually means older or farther"],
          ],
          say: "Two 4-beds fit your budget. The trade-off is the usual one: more room, a little longer drive or an older build. I can ask Jordan to add one after your Maple Ridge viewing.",
          card: {
            title: "4-bed homes up to $500k",
            tone: "info",
            rows: [["1120 Fallow Bend", "$499,000 · 4 / 2.5 · 2,150 sq ft · 28 min"], ["63 Wren Hollow Dr", "$492,500 · 4 / 2 · 1,980 sq ft · built 1996"]],
          },
          choices: [
            { label: "Book Maple Ridge first", go: "book" },
            { label: "Ask Jordan to add one", go: "_human" },
          ],
        },
      ],
      next: ["book", "_human", "details"],
    },
    book: {
      ask: "I'd like to see it. Can I book a viewing?",
      chip: "Book a viewing",
      keys: ["viewing", "view", "showing", "see it", "see the house", "tour it", "take a tour", "tour the house", "visit", "book", "schedule", "appointment", "walk through", "private viewing", "in person", "come by"],
      beats: [
        {
          trace: [
            ["understand", "Viewing request", "214 Maple Ridge Dr · intent score 62"],
            ["rule", "Qualify in conversation", "Two quick questions before booking, never a form"],
            ["act", "CRM · lead created", "Source: listing ad · stage: New"],
          ],
          say: "Happy to set that up. One quick question so I match you with the right agent: are you pre-approved for a mortgage yet?",
          choices: [
            { label: "Pre-approved", go: "preapproved" },
            { label: "Not yet", go: "notyet" },
          ],
        },
      ],
      next: ["preapproved", "notyet"],
    },
    preapproved: {
      ask: "Pre-approved, up to $500k. We want to move in the next two months.",
      chip: "Pre-approved",
      keys: ["pre-approved", "preapproved", "pre approved", "approved", "approval letter", "500k", "two months", "2 months", "ready to buy", "already approved", "qualified", "cash buyer"],
      beats: [
        {
          trace: [
            ["understand", "Qualified buyer", "Pre-approved to $500k · timeline under 60 days"],
            ["act", "Lead scored", "62 → 88 · +16 pre-approved, +10 moving soon"],
            ["rule", "Routing", "Score ≥ 80 → senior agent + instant SMS alert"],
            ["person", "Hot lead alert", "Jordan texted: High intent (88) · Maple Ridge"],
          ],
          say: "Perfect, $485k sits comfortably in that range. I've flagged you to **Jordan**, the listing agent. Here's when Jordan can show it:",
          choices: [
            { label: "Saturday 11:00 AM", go: "slot" },
            { label: "Thursday 5:30 PM", go: "slotthu" },
          ],
        },
      ],
      next: ["slot", "slotthu", "quiet"],
    },
    notyet: {
      ask: "Not yet. We're probably moving in 3 to 6 months.",
      chip: "Not yet",
      keys: ["not yet", "no lender", "not approved", "haven't", "havent", "no pre", "need a loan", "3 to 6 months", "few months", "next year", "just starting"],
      beats: [
        {
          trace: [
            ["understand", "Early-stage buyer", "No pre-approval · timeline 3–6 months"],
            ["act", "Lead scored", "62 → 64 · +2 timeline stated"],
            ["rule", "Routing", "Score < 80 → Jordan's queue, email alert within 1 hr"],
            ["guard", "No financial advice", "Won't guess what they'd qualify for or rates"],
          ],
          say: "That's a great time to look. I can't advise on mortgages, but I can introduce you to the lender our team works with most, if you'd like. Totally your call, and you can still book the viewing either way.",
          choices: [
            { label: "Yes, introduce me", go: "lender" },
            { label: "Book Saturday 11:00 AM", go: "slot" },
          ],
        },
      ],
      next: ["lender", "slot", "firsttime"],
    },
    lender: {
      ask: "Yes, introduce me to the lender.",
      chip: "Introduce me to the lender",
      keys: ["recommend a lender", "need a lender", "your lender", "the lender", "lender recommendation", "mortgage", "loan", "introduce", "intro", "financing", "rates", "interest", "afford", "mortgage broker", "monthly payment"],
      beats: [
        {
          trace: [
            ["guard", "Buyer chooses the lender", "One suggestion, no pressure, any lender works"],
            ["check", "Preferred lender", "Dana · local mortgage broker · calls same day"],
            ["act", "Intro sent with consent", "Name, phone and timeline shared with Dana only"],
            ["act", "Lead scored", "64 → 72 · +8 lender intro accepted"],
          ],
          say: "Done. **Dana** will call you tomorrow to talk numbers, no obligation. Meanwhile, want to see the house this week?",
          card: { title: "Intro to Dana · Lender", meta: "Preferred by the team · optional", pill: "Calls tomorrow", tone: "handoff" },
          choices: [
            { label: "Saturday 11:00 AM", go: "slot" },
            { label: "Thursday 5:30 PM", go: "slotthu" },
          ],
        },
      ],
      next: ["slot", "slotthu", "firsttime"],
    },
    firsttime: {
      ask: "We're first-time buyers. How does the whole process work?",
      chip: "First-time buyer questions",
      keys: ["first time", "first-time", "first home", "never bought", "how does buying work", "process", "steps", "closing costs", "earnest money", "option fee", "escrow", "title company", "down payment", "how long does it take", "what do i need"],
      beats: [
        {
          trace: [
            ["understand", "First-time buyer", "Wants the steps + rough costs"],
            ["check", "Team buyer guide", "Texas process · 6 steps · typical 30–45 day close"],
            ["guard", "No financial advice", "Typical ranges only · real numbers come from a lender"],
            ["act", "Lead scored", "+4 · first-time buyer, buyer-guide track"],
          ],
          say: "Here's the path most buyers follow, usually **30–45 days** from accepted offer to keys. The costs below are typical ranges, not advice. Your lender gives the real numbers for your loan.",
          card: {
            title: "Buying a home in Texas",
            meta: "Typical ranges on a $485k home",
            tone: "info",
            steps: { list: ["Pre-approval", "Tour homes", "Offer + earnest money", "Option period + inspection", "Appraisal + loan", "Closing"], at: 0 },
            rows: [["Earnest money", "Often ~1% · about $4,850"], ["Option fee", "Often $100–$500"], ["Closing costs", "Often 2–5% · set by your lender"]],
          },
        },
        {
          trace: [
            ["rule", "Offer a next step", "One helpful action, never a push"],
            ["act", "Buyer guide sent", "PDF by text · no sign-up"],
          ],
          say: "I've texted you our buyer guide. Most people start with pre-approval, since it tells you your real budget before you fall for a house.",
          choices: [
            { label: "Introduce me to a lender", go: "lender" },
            { label: "Book a viewing anyway", go: "book" },
          ],
        },
      ],
      next: ["lender", "inspection", "book"],
    },
    inspection: {
      ask: "What happens with the inspection and appraisal?",
      chip: "Inspection and appraisal",
      keys: ["inspection", "inspector", "appraisal", "appraise", "appraised", "option period", "foundation", "roof", "hvac", "disclosure", "seller's disclosure", "repairs", "termite", "survey", "low appraisal", "problems with the house"],
      beats: [
        {
          trace: [
            ["understand", "Due diligence question", "Inspection + appraisal · how it works"],
            ["check", "Seller's disclosure", "Roof 2019 · HVAC 2021 · no known foundation issues"],
            ["rule", "Buyer picks the inspector", "Share 3 local names, never require one"],
            ["guard", "Won't predict appraisal", "Value is the appraiser's call, not the chat's"],
          ],
          say: "You'd have an **option period**, often 7–10 days, to inspect and back out if something's off. You pick the inspector, and I can send three local names. The lender orders the appraisal, and if it comes in low, Jordan walks you through your options.",
          card: {
            title: "214 Maple Ridge Dr · disclosures",
            tone: "info",
            rows: [["Roof", "Replaced 2019"], ["HVAC", "Replaced 2021"], ["Foundation", "No known issues disclosed"], ["Full disclosure", "Jordan brings it to the viewing"]],
          },
        },
      ],
      next: ["makeoffer", "firsttime", "book"],
    },
    relocate: {
      ask: "We're moving from out of state and can't visit before we decide.",
      chip: "Relocating from out of state",
      keys: ["relocating", "relocate", "relocation", "out of state", "out of town", "moving to austin", "moving from", "can't visit", "cant visit", "live far", "virtual showing", "video call", "long distance", "different state", "fly in", "remote buyer"],
      beats: [
        {
          trace: [
            ["understand", "Relocating buyer", "Out of state · needs remote options"],
            ["check", "Calendar · Jordan", "Live video tours · Fri 12:30 PM open"],
            ["rule", "Remote buyers", "Live video + 3D tour before any trip"],
            ["act", "Lead scored", "+6 · relocating, a firm move need"],
          ],
          say: "Lots of our buyers do this. Jordan can walk you through the house live on a **video call**, opening closets and checking the street, and you can ask anything. Friday at 12:30 PM Austin time is open. Does that work?",
        },
        { from: "user", say: "Friday 12:30 works. We're two hours behind." },
        {
          trace: [
            ["understand", "Time zone", "Visitor is Pacific · 12:30 PM Austin = 10:30 AM theirs"],
            ["act", "Video tour booked", "Fri 12:30 PM CT · link sent · on Jordan's calendar"],
            ["act", "Reminder queued", "SMS Fri 10:00 AM their time"],
          ],
          say: "Booked: **Friday 12:30 PM Austin time**, which is 10:30 AM for you. The video link is in your texts. Meanwhile, the 3D tour is a good first look.",
          card: {
            title: "Live video tour · 214 Maple Ridge Dr",
            pill: "Booked",
            tone: "ok",
            rows: [["When", "Fri 12:30 PM CT · 10:30 AM PT"], ["Agent", "Jordan · Listing agent"], ["Link", "Sent by text"]],
          },
        },
      ],
      next: ["photos", "firsttime", "hood"],
    },
    slot: {
      ask: "Saturday 11:00 AM works.",
      chip: "Saturday 11:00 AM",
      keys: ["saturday", "sat", "11", "11:00", "11am", "11 am", "weekend", "morning", "this weekend", "saturday morning"],
      beats: [
        {
          trace: [
            ["check", "Calendar · Jordan", "Sat 11:00 open · 2 hr buffer before open house"],
            ["act", "Booked + synced", "Event on Jordan's calendar · invite to buyer"],
            ["act", "CRM · stage", "Qualified → Booked"],
            ["act", "Reminders queued", "SMS Fri 6 PM and Sat 9 AM"],
          ],
          say: "You're booked for **Saturday at 11:00 AM** at 214 Maple Ridge Dr. I'll text you a reminder Friday evening and Saturday morning.",
          card: {
            title: "Viewing · 214 Maple Ridge Dr",
            pill: "Booked",
            tone: "ok",
            rows: [["When", "Sat 11:00 AM · 30 min"], ["Agent", "Jordan · Listing agent"], ["Calendar", "Synced"], ["Reminders", "Fri 6 PM · Sat 9 AM"]],
          },
        },
        {
          from: "person",
          who: "Jordan · Listing agent",
          trace: [["person", "Agent confirmed", "Jordan accepted the showing in 40 sec"]],
          say: "Hi, Jordan here. See you Saturday at 11. I'll bring the seller's disclosure and HOA docs so you can look them over on site.",
        },
      ],
      next: ["details", "reschedule", "late", "makeoffer"],
    },
    slotthu: {
      ask: "Thursday 5:30 PM, after work.",
      chip: "Thursday 5:30 PM",
      keys: ["thursday", "thu", "thurs", "5:30", "530", "after work", "evening", "thursday evening", "5:30 pm", "weeknight"],
      beats: [
        {
          trace: [
            ["check", "Calendar · Jordan", "Thu 5:30 open · sunset 7:05 PM, good light"],
            ["act", "Booked + synced", "Event on Jordan's calendar · invite to buyer"],
            ["act", "CRM · stage", "Qualified → Booked"],
            ["act", "Reminders queued", "SMS Wed 6 PM and Thu 3:30 PM"],
          ],
          say: "You're booked for **Thursday at 5:30 PM** at 214 Maple Ridge Dr. Reminders will come by text the evening before and two hours ahead.",
          card: {
            title: "Viewing · 214 Maple Ridge Dr",
            pill: "Booked",
            tone: "ok",
            rows: [["When", "Thu 5:30 PM · 30 min"], ["Agent", "Jordan · Listing agent"], ["Calendar", "Synced"], ["Reminders", "Wed 6 PM · Thu 3:30 PM"]],
          },
        },
        {
          from: "person",
          who: "Jordan · Listing agent",
          trace: [["person", "Agent confirmed", "Jordan accepted the showing in 52 sec"]],
          say: "Hi, Jordan here. Thursday at 5:30 is great. Park in the driveway, I'll meet you out front.",
        },
      ],
      next: ["details", "reschedule", "makeoffer"],
    },
    reschedule: {
      ask: "Something came up. Can I change or cancel my Saturday viewing?",
      chip: "Change or cancel my viewing",
      keys: ["reschedule", "change the time", "change my viewing", "different day", "different time", "move it", "cancel", "cancel the viewing", "cancel my viewing", "can't make it", "cant make it", "something came up", "rebook", "another time", "postpone", "push it back"],
      beats: [
        {
          trace: [
            ["understand", "Change of plans", "Saturday 11:00 viewing · move or cancel"],
            ["check", "Booking", "Sat 11:00 AM · Jordan · 214 Maple Ridge Dr"],
            ["rule", "No-fuss changes", "Move or cancel any time, no questions asked"],
            ["act", "Slot released", "Sat 11:00 freed · Fri + Sat reminders stopped"],
          ],
          say: "No problem at all. I've released Saturday at 11:00 and stopped those reminders. Want a new time, or leave it for now?",
          choices: [
            { label: "Thursday 5:30 PM instead", go: "slotthu" },
            { label: "Leave it for now", go: "quiet" },
          ],
        },
        {
          trace: [["person", "Jordan notified", "Saturday showing cancelled by buyer · no action needed"]],
          from: "event",
          say: "Jordan's calendar updated automatically",
        },
      ],
      next: ["slotthu", "quiet", "photos"],
    },
    late: {
      ask: "Running about 15 minutes late, sorry!",
      chip: "I'm running late",
      keys: ["running late", "im late", "i'm late", "be late", "late for", "15 minutes", "traffic", "stuck in", "on my way", "omw", "delayed", "can't find the house", "cant find", "eta"],
      beats: [
        {
          trace: [
            ["understand", "Running late", "~15 min · Saturday 11:00 viewing"],
            ["check", "Calendar · Jordan", "Next commitment: open house at 1 PM · room to wait"],
            ["act", "Jordan texted", "New ETA 11:15 AM · buyer on the way"],
          ],
          say: "No worries, there's plenty of room before the open house, so 11:15 is fine. I've let Jordan know. Park in the driveway at 214 Maple Ridge Dr.",
        },
        {
          from: "person",
          who: "Jordan · Listing agent",
          trace: [["person", "Agent replied", "Jordan acknowledged the new ETA in 1 min"]],
          say: "All good, drive safe. I'll have the lights on and the back door open so you can see the yard first.",
        },
      ],
      next: ["details", "inspection", "makeoffer"],
    },
    hood: {
      ask: "What's the neighbourhood like? Are the schools good?",
      chip: "What's the neighbourhood like?",
      keys: ["neighborhood", "neighbourhood", "schools", "school", "area", "safe", "safety", "crime", "families", "community", "commute", "who lives", "nearby", "neighbors", "diverse", "demographics", "what kind of people", "downtown", "grocery"],
      beats: [
        {
          trace: [
            ["understand", "Area + schools", "Asked for a judgement: 'what's it like', 'good'"],
            ["guard", "Fair housing", "Never describe areas by who lives there or call them 'safe'"],
            ["check", "Listing facts", "Cedar Valley ISD · district boundary map link"],
            ["check", "Commute + nearby", "22 min to downtown at 8 AM · park 0.4 mi"],
          ],
          say: "I stick to facts here so you can judge for yourself. The home is in **Cedar Valley ISD**, and the state ratings are one tap away. Downtown is about 22 minutes at rush hour, with a park and trail a short walk away. For crime data, the city's public map is the best source.",
          card: {
            title: "214 Maple Ridge Dr · facts",
            tone: "info",
            rows: [["School district", "Cedar Valley ISD"], ["Ratings", "State report card link"], ["Commute", "22 min to downtown · 8 AM"], ["Nearby", "Park + trail 0.4 mi · grocery 1.1 mi"], ["HOA", "$45 / month"]],
          },
        },
      ],
      next: ["book", "details", "similar"],
    },
    offer: {
      ask: "Will they take $450k?",
      chip: "Will they take $450k?",
      keys: ["450", "450k", "negotiate", "negotiation", "lower", "take less", "bottom line", "best price", "below asking", "lowball", "come down", "flexible", "motivated seller", "seller flexible", "flexible on price", "why are they selling", "price drop"],
      beats: [
        {
          trace: [
            ["understand", "Price negotiation", "$450k · $35k under the $485k asking"],
            ["guard", "No speculating", "Never guess the seller's bottom line or motivation"],
            ["rule", "Offers go to the agent", "Price talk is handled by a licensed agent only"],
            ["person", "Jordan notified", "Buying signal · call requested for tomorrow"],
          ],
          say: "Fair question, but I won't guess what the seller would accept. That's a conversation for **Jordan**, who can show you recent sales on the street and what a strong offer looks like.",
          card: { title: "Handed to Jordan", meta: "Offer question · $450k on $485k", pill: "Calls tomorrow", tone: "handoff" },
        },
        { from: "event", say: "6 minutes later", wait: 700 },
        {
          from: "person",
          who: "Jordan · Listing agent",
          trace: [["person", "A person took over", "Jordan picked up the thread from the alert"]],
          say: "Hi, Jordan here. Smart to ask early. I'll pull the last six sales nearby so we can talk real numbers. Does a quick call at 6 tomorrow work?",
        },
      ],
      next: ["makeoffer", "book", "sell"],
    },
    makeoffer: {
      ask: "We love it. We want to make an offer.",
      chip: "I want to make an offer",
      keys: ["offer", "make an offer", "put in an offer", "submit an offer", "write an offer", "place an offer", "full price", "at asking", "ready to offer", "want to buy it", "bid", "we love it", "sign the papers", "next step to buy"],
      beats: [
        {
          trace: [
            ["understand", "Offer intent", "Wants to make an offer · 214 Maple Ridge Dr"],
            ["act", "Lead scored", "→ 95 · offer intent, top of Jordan's list"],
            ["guard", "No promises", "Never say an offer will be accepted, or share other offers"],
            ["rule", "Licensed agent writes it", "Chat gathers basics, Jordan drafts and submits"],
          ],
          say: "That's exciting. Offers are written by a licensed agent, so I'm getting **Jordan** now. I can't promise how the seller will respond, but a clean offer helps. Have your pre-approval letter handy.",
          card: {
            title: "Offer · 214 Maple Ridge Dr",
            meta: "Listed at $485,000",
            pill: "With Jordan",
            tone: "handoff",
            steps: { list: ["Pre-approval letter", "Price + terms with Jordan", "Jordan writes the offer", "Seller responds"], at: 1 },
          },
        },
        {
          from: "person",
          who: "Jordan · Listing agent",
          trace: [
            ["person", "Agent took over", "Jordan joined in 3 min from the hot-lead alert"],
            ["rule", "Representation in writing", "Seller's agent too → explains options before drafting"],
          ],
          say: "Hi, Jordan here. Great news. Since I represent the seller, I'll explain your options first, including having a teammate represent you. Can we talk at 7:30 tonight?",
        },
      ],
      next: ["inspection", "commission", "firsttime"],
    },
    commission: {
      ask: "How much is your commission?",
      chip: "What's your commission?",
      keys: ["commission", "commissions", "agent fee", "realtor fee", "your fee", "percentage", "how much do you charge", "what do you charge", "buyer agreement", "who pays the agent", "listing fee", "6 percent", "3 percent", "agent cost"],
      beats: [
        {
          trace: [
            ["understand", "Fee question", "Commission · buyer or seller side unclear"],
            ["guard", "No quoting fees", "Commission is negotiable, agreed in writing with an agent"],
            ["rule", "Fee talk → agent", "Licensed agent explains, chat never negotiates"],
            ["person", "Jordan notified", "Fee question · reply within the hour"],
          ],
          say: "Good thing to ask up front. Fees aren't set by law. They're agreed in writing with your agent before any work starts, buying or selling. I won't quote a number here, but **Jordan** will walk you through it within the hour, nothing hidden.",
          card: { title: "Fee question · to Jordan", meta: "Written agreement before any work", pill: "Within the hour", tone: "handoff" },
        },
      ],
      next: ["sell", "makeoffer", "otheragent"],
    },
    otheragent: {
      ask: "I'm already working with another agent.",
      chip: "I already have an agent",
      keys: ["another agent", "other agent", "my agent", "my realtor", "have an agent", "have a realtor", "working with someone", "represented", "my own agent", "buyer's agent", "buyers agent", "signed with", "already have someone"],
      beats: [
        {
          trace: [
            ["understand", "Represented buyer", "Already has an agent · interested in the home"],
            ["rule", "Respect representation", "No poaching, no pitching, no sales follow-ups"],
            ["act", "CRM · tagged", "Has agent · nurture texts off · score paused"],
            ["act", "Listing sheet sent", "Facts + disclosure summary to forward to their agent"],
          ],
          say: "Thanks for telling me, and no problem at all. We won't step in between you and your agent. I've texted you the listing sheet to forward. Your agent can book a showing with Jordan directly.",
          card: { title: "Showing via your agent", meta: "Agents book with Jordan directly", pill: "No follow-ups", tone: "info" },
        },
      ],
      next: ["photos", "details", "hood"],
    },
    rent: {
      ask: "Do you have anything to rent instead?",
      chip: "Can I rent instead?",
      keys: ["rent", "renting", "for rent", "to rent", "rent instead", "lease", "leasing", "apartment", "tenant", "month to month", "rental listings", "not ready to buy"],
      beats: [
        {
          trace: [
            ["understand", "Looking to rent", "Not a buyer right now"],
            ["rule", "Sales only", "Team doesn't do rentals → partner leasing team"],
            ["act", "Referral texted", "Leasing team's contact sent to visitor · nothing shared"],
            ["learn", "Lead tagged", "Renter today, possible buyer later · no sales texts"],
          ],
          say: "We only help people buy and sell, so we don't have rentals. A local leasing team we trust does, and I've texted you their contact. If you ever want to buy, we're here.",
          card: { title: "Leasing referral", meta: "Partner team · rentals across Austin", pill: "Contact sent", tone: "info" },
        },
      ],
      next: ["firsttime", "similar"],
    },
    invest: {
      ask: "I'm an investor. What rental yield would this get?",
      chip: "Is it a good investment?",
      keys: ["investor", "investment", "invest", "rental income", "cash flow", "cashflow", "yield", "roi", "return", "cap rate", "short-term rental", "rent it out", "landlord", "appreciation", "good investment", "flip"],
      beats: [
        {
          trace: [
            ["understand", "Investor question", "Rental yield · 214 Maple Ridge Dr"],
            ["guard", "No investment advice", "No yield, rent or appreciation forecasts"],
            ["check", "HOA leasing rules", "Min 12-month lease · no short-term rentals"],
            ["act", "Lead scored", "+5 · investor tag · route to Jordan"],
          ],
          say: "I can't predict rent or returns, that would be investment advice. Here are the facts that matter: leases must be **12 months minimum** and short-term rentals aren't allowed. Jordan can share recent lease data nearby.",
          card: {
            title: "Investor facts · 214 Maple Ridge Dr",
            tone: "info",
            rows: [["Price", "$485,000"], ["HOA", "$45 / month"], ["Property tax", "$9,840 (2025 bill)"], ["Leasing", "12-month minimum · no short-term"]],
          },
        },
      ],
      next: ["details", "_human", "makeoffer"],
    },
    sell: {
      ask: "We'd need to sell our current house first.",
      chip: "I need to sell my house first",
      keys: ["sell my", "sell our", "selling my", "selling our", "need to sell", "want to sell", "our house", "my house", "my home", "current home", "current house", "valuation", "worth", "what's my home worth", "list my", "contingent", "two mortgages", "sell first"],
      beats: [
        {
          trace: [
            ["understand", "Home to sell first", "Buyer + seller lead · timing matters"],
            ["guard", "No price guesses", "Home values come from an agent's analysis, not the chat"],
            ["act", "Lead scored", "+20 · two-sided lead, buy and sell"],
            ["person", "Jordan notified", "Market analysis promised by tomorrow 5 PM"],
          ],
          say: "Really common, and worth planning both sides together. I won't guess what your home is worth, but Jordan will send a proper valuation by **tomorrow 5 PM**. What's the address?",
          card: { title: "Home valuation", meta: "Requested · sent to Jordan", pill: "By tomorrow 5 PM", tone: "handoff" },
          choices: [{ label: "1907 Birch Hollow Ln", go: "selladdr" }],
        },
      ],
      next: ["selladdr", "commission", "book"],
    },
    selladdr: {
      ask: "It's 1907 Birch Hollow Ln.",
      chip: "Give my address",
      keys: ["birch hollow", "birch", "1907", "my address", "address is", "we live at", "located at", "street", "lane", "avenue", "road", "zip code"],
      beats: [
        {
          trace: [
            ["understand", "Seller address", "1907 Birch Hollow Ln, Austin"],
            ["check", "County record", "3 bd / 2 ba · 1,620 sq ft · built 1998"],
            ["act", "CRM · seller file", "Address + records added for Jordan's analysis"],
          ],
          say: "Got it, **1907 Birch Hollow Ln**: 3 beds, 2 baths, about 1,620 sq ft per the county. Jordan will use that plus recent sales. When are you hoping to sell?",
          choices: [
            { label: "Within 3 months", go: "valbook" },
            { label: "Talk to Jordan first", go: "_human" },
          ],
        },
      ],
      next: ["valbook", "_human"],
    },
    valbook: {
      ask: "Within 3 months, ideally buying and selling together.",
      chip: "Within 3 months",
      keys: ["within 3 months", "next 3 months", "asap", "as soon as possible", "right away", "market analysis", "cma", "come see my house", "visit my house", "book a valuation", "in-home valuation", "buy and sell together"],
      beats: [
        {
          trace: [
            ["understand", "Seller timeline", "Under 3 months · buy + sell together"],
            ["rule", "Valuation in person", "Under 6 months → in-home walk-through, best accuracy"],
            ["check", "Calendar · Jordan", "Mon 4:00 PM · Tue 6:00 PM open"],
          ],
          say: "Then a quick in-home walk-through gives the most accurate number, about 45 minutes. Jordan has **Monday 4:00 PM** or **Tuesday 6:00 PM**. The written estimate still arrives by tomorrow 5 PM either way.",
        },
        { from: "user", say: "Monday at 4 works." },
        {
          trace: [
            ["act", "Booked + synced", "Mon 4:00 PM · 1907 Birch Hollow Ln · Jordan"],
            ["act", "CRM · stage", "Seller: Valuation booked · linked to buyer file"],
            ["act", "Reminder queued", "SMS Mon 9 AM"],
          ],
          say: "Booked. Jordan will come by **Monday at 4:00 PM**. No need to tidy up, it's about the house, not the dishes.",
          card: {
            title: "Home valuation visit",
            pill: "Booked",
            tone: "ok",
            rows: [["Where", "1907 Birch Hollow Ln"], ["When", "Mon 4:00 PM · 45 min"], ["Agent", "Jordan"], ["Written estimate", "By tomorrow 5 PM"]],
          },
        },
      ],
      next: ["commission", "book", "makeoffer"],
    },
    quiet: {
      ask: "I'll think about it and get back to you.",
      chip: "I'll think about it",
      keys: ["think about it", "maybe later", "not ready", "maybe", "get back", "not sure", "busy", "let me think", "no rush", "sleep on it", "need time", "talk it over"],
      beats: [
        {
          trace: [
            ["understand", "Not ready yet", "Soft no · no time picked"],
            ["rule", "Follow-up cadence", "One follow-up after 24h, stop after 3"],
            ["act", "Follow-up scheduled", "SMS · tomorrow 10:00 AM"],
          ],
          say: "No rush at all. I'll keep the listing saved for you. Message here any time.",
        },
        { from: "event", say: "Next day · 10:00 AM · no reply", wait: 900 },
        {
          trace: [
            ["check", "MLS lookup", "214 Maple Ridge Dr · still Active · $485,000"],
            ["rule", "Follow-up 1 of 3", "Friendly, one question, easy to say no"],
            ["act", "SMS sent", "Reply STOP to opt out"],
          ],
          say: "Hi, it's the team assistant. The Maple Ridge home is still available and the open house is Saturday 1–4 PM. Want me to save you a quieter private time?",
          choices: [
            { label: "Book Saturday 11:00 AM", go: "slot" },
            { label: "Not interested", go: "stop" },
          ],
        },
      ],
      next: ["slot", "stop", "similar"],
    },
    stop: {
      ask: "Not interested, please stop texting.",
      chip: "Not interested",
      keys: ["stop", "unsubscribe", "not interested", "no thanks", "leave me alone", "don't text", "dont text", "remove me", "opt out", "stop texting", "spam"],
      beats: [
        {
          trace: [
            ["rule", "Stop means stop", "Follow-ups 2 and 3 cancelled"],
            ["act", "CRM · opted out", "Marked 'not now' · no more texts · score frozen"],
            ["learn", "Lead source noted", "Listing ad → early browser, for the team's ad report"],
          ],
          say: "Understood, no more texts from us. If you ever want to look again, just message here. Good luck with the search!",
        },
      ],
    },
  },
  fallback: {
    beats: [
      {
        trace: [
          ["understand", "No confident match", "Not a listing, viewing, financing or selling question"],
          ["guard", "Don't guess", "Unclear questions go to a person, not a made-up answer"],
          ["act", "Sent to Jordan", "Thread forwarded · reply within the hour"],
        ],
        say: "I'm not sure about that one, and I'd rather not guess. I've passed it to Jordan, who'll reply within the hour. Anything on a listing, a viewing, buying or selling I can help with now?",
      },
    ],
  },
  capped: {
    beats: [
      {
        trace: [
          ["guard", "Monthly cap reached", "$50 of $50 used → assistant paused"],
          ["act", "Lead still captured", "Message and contact saved in CRM"],
          ["person", "A person replies", "Jordan, within the hour, same thread"],
        ],
        from: "event",
        say: "Assistant paused · Jordan will reply here within the hour",
      },
    ],
  },
});

(window.AI_CASES ||= []).push({
  id: "quoting",
  site: "ai-quoting-site.webp",
  domain: "www.northstarair.com",
  tab: "Home services",
  icon: "wrench",
  name: "Service assistant",
  status: "Texts back in under a minute",
  accent: "#e8590c",
  who: "You're a homeowner whose AC just stopped cooling, texting a heating and cooling company.",
  pitch: "Answers estimate requests by text in under a minute, books the nearest technician, and follows up on quotes until they're booked or declined.",
  plan: "On your Claude or Codex plan, or pay-as-you-go with a cap you set",
  budget: { spent: 17.8, cap: 30, per: 0.004 },
  brief: "An AI assistant for my home services business that answers estimate requests by text, books jobs and follows up on quotes",
  team: "the office",
  replyBy: "within the hour",
  greeting: [
    { say: "Hi, you've reached the service team's text line. Tell me what's going on with your system and I'll help you sort it out or get someone booked." },
  ],
  start: ["warm", "price", "followup", "emergency"],
  menu: ["furnace", "leak", "noise", "bill", "replace", "warranty", "area", "late", "reschedule", "payment", "plan", "commercial"],
  topics: {
    warm: {
      ask: "My AC is blowing warm air.",
      chip: "My AC is blowing warm air",
      keys: ["warm", "warm air", "not cooling", "not blowing cold", "air conditioner", "aircon", "a/c", "stopped cooling", "won't cool", "wont cool", "blowing warm", "house is hot", "not getting cold", "ac broke", "ac stopped", "ac not working", "ac busted"],
      beats: [
        {
          trace: [
            ["understand", "No cooling", "AC blowing warm air · homeowner"],
            ["check", "Customer record", "Number matches · 1 past visit, 2023 tune-up"],
            ["rule", "Triage before booking", "Max 3 quick questions, then offer a slot"],
          ],
          say: "Sorry, that's no fun in this heat. Quick question so we send the right tech: what's the system doing?",
          choices: [
            { label: "Running but warm", go: "running" },
            { label: "Not turning on at all", go: "diy" },
            { label: "Smells like burning", go: "emergency" },
          ],
        },
      ],
      next: ["running", "price", "book"],
    },
    running: {
      ask: "It's running, but the air is warm.",
      chip: "Running but warm",
      keys: ["running but warm", "its running", "it runs", "no cold air", "no cold", "still running", "fan works", "fan runs", "turns on fine", "on but warm", "outdoor unit", "condenser", "sticker", "model number", "serial", "nameplate", "photo", "picture"],
      beats: [
        {
          trace: [
            ["understand", "Runs, doesn't cool", "Fan on · air warm · likely outdoor unit"],
            ["rule", "Model sticker first", "Lets the tech load the right parts before driving out"],
          ],
          say: "Got it. Could you text a photo of the sticker on the outdoor unit? It's usually on the side panel, with the model and serial number.",
        },
        { from: "user", say: "Here you go. IMG_3318.jpg", wait: 600 },
        {
          trace: [
            ["check", "Photo read · sticker", "3-ton condenser · made 2011 · refrigerant R-22"],
            ["rule", "Old unit or R-22", "12+ years or R-22 → tech quotes repair and replace"],
            ["act", "Added to job notes", "Tech loads capacitor, contactor, R-22 leak kit"],
          ],
          say: "Thanks, that's clear. It's a **2011 unit on R-22**, an older refrigerant that's being phased out. The tech will bring the usual parts and give you a repair price and a replacement price side by side.",
          card: { title: "Your outdoor unit", meta: "Read from IMG_3318.jpg", pill: "15 years old", tone: "info", rows: [["Made", "2011"], ["Size", "3 ton"], ["Refrigerant", "R-22 (phased out)"]] },
        },
      ],
      next: ["book", "price", "expensive"],
    },
    diy: {
      ask: "Can I fix it myself? It won't even turn on.",
      chip: "Can I fix it myself?",
      keys: ["myself", "diy", "fix it myself", "refrigerant", "freon", "recharge", "add gas", "top up", "breaker", "tripped", "thermostat", "blank screen", "screen is blank", "display off", "batteries", "not turning on", "won't turn on", "wont turn on", "no power", "dead"],
      beats: [
        {
          trace: [
            ["understand", "Wants to try first", "Won't turn on · thermostat may be blank"],
            ["guard", "No unsafe DIY", "Refrigerant and electrical work → licensed tech only"],
            ["check", "Safe-checks list", "Thermostat batteries + mode · breaker · filter"],
          ],
          say: "There are three safe things worth checking first. A **blank thermostat** is usually just batteries or a tripped breaker. If none of these fixes it, we'll send someone. Anything beyond that, like refrigerant or the wiring inside the unit, needs a licensed tech, so I won't walk you through those.",
          card: { title: "Safe checks", meta: "About 5 minutes", pill: "Safe to try", tone: "ok", rows: [["Thermostat", "Fresh batteries · set to Cool · 3° below room"], ["Breaker", "Off, then on once. If it trips again, leave it off"], ["Air filter", "Swap it if it's grey or clogged"]] },
          choices: [
            { label: "That fixed it", go: "_thanks" },
            { label: "Still nothing", go: "book" },
          ],
        },
      ],
      next: ["book", "price", "emergency"],
    },
    emergency: {
      ask: "I smell burning near the AC.",
      chip: "Burning smell near the AC",
      keys: ["burning", "burning smell", "smoke", "smoking", "gas smell", "smell gas", "smells like gas", "rotten egg", "sparks", "sparking", "fire", "water near", "flooding", "electrical", "emergency", "urgent", "carbon monoxide", "co alarm", "outlet", "wiring", "near the panel"],
      beats: [
        {
          trace: [
            ["understand", "Possible emergency", "Burning smell near the system"],
            ["rule", "Safety first", "Gas, burning or water near electrics → safety steps first"],
            ["act", "On-call tech flagged", "Dispatch paged · priority 1 · callback in 5 min"],
          ],
          say: "Please turn the AC off at the thermostat now and stay away from the unit. If you see smoke or flames, leave the house and call **911**. If it ever smells like gas, go outside first and call the gas company from there. Our on-call team is calling you now.",
          card: { title: "On-call team paged", meta: "Priority 1 · burning smell", pill: "Call in 5 min", tone: "alert" },
        },
        { from: "event", say: "2 minutes later", wait: 800 },
        {
          from: "person",
          who: "Rosa · On-call dispatch",
          trace: [["person", "Dispatcher took over", "Rosa called · system off · tech Eli en route, 35 min"]],
          say: "Hi, it's Rosa from dispatch, thanks for picking up. With the system off you're safe to wait. Eli, our on-call tech, is heading over now, about 35 minutes out. I'll text when he's close.",
        },
      ],
      next: ["price", "late"],
    },
    price: {
      ask: "How much will this cost?",
      chip: "How much will this cost?",
      keys: ["cost", "price", "how much", "ballpark", "ballpark figure", "charge", "fee", "rates", "pricing", "diagnostic", "service call", "trip fee", "call-out", "what do you charge"],
      beats: [
        {
          trace: [
            ["understand", "Price question", "AC not cooling · no diagnosis yet"],
            ["check", "Price book · visit", "Diagnostic $89 · waived if we do the repair"],
            ["check", "Price book · repairs", "Capacitor $150–250 · contactor $180–300 · R-22 $400–800"],
            ["guard", "Ranges only", "Never invent a number · final quote on site"],
          ],
          say: "The visit is **$89**, and that's waived if we do the repair. Most no-cooling fixes land in these ranges. I can't give an exact price before a tech has looked, but you'll get a written quote before any work starts.",
          card: { title: "Common AC repairs", meta: "From the price book", pill: "Ranges", tone: "info", rows: [["Diagnostic visit", "$89 · waived with repair"], ["Capacitor", "$150–250"], ["Contactor", "$180–300"], ["R-22 leak fix + recharge", "$400–800"]] },
        },
      ],
      next: ["book", "replace", "payment"],
    },
    book: {
      ask: "Can someone come out and look at it?",
      chip: "Book a visit",
      keys: ["book", "booking", "schedule", "come out", "send someone", "visit", "available", "availability", "slot", "when can", "someone look", "get someone out", "make an appointment", "book an appointment", "need an appointment"],
      beats: [
        {
          trace: [
            ["check", "Tech routes · live", "Marco finishing a job 3 mi away · free from 3:45"],
            ["check", "Calendar · openings", "Today 4–6 PM · Tomorrow 8–10 AM"],
            ["rule", "Smart scheduling", "Offer the slot where a tech is already nearby first"],
          ],
          say: "Good news, Marco is finishing a job about 3 miles from you, so we can do **today between 4 and 6 PM**. Otherwise tomorrow morning, 8 to 10.",
          choices: [
            { label: "Today 4–6 PM", go: "today" },
            { label: "Tomorrow 8–10 AM", go: "tomorrow" },
          ],
        },
      ],
      next: ["today", "tomorrow", "price"],
    },
    today: {
      ask: "Today 4–6 PM",
      keys: ["today", "this afternoon", "4-6", "4–6", "4 pm", "asap", "soonest", "tonight", "earliest", "same day", "marco", "right away"],
      beats: [
        {
          trace: [
            ["act", "Booked · Job #J-2287", "Today 4–6 PM · Marco · AC not cooling"],
            ["check", "Job notes", "2011 R-22 unit · parts on the truck"],
            ["rule", "ETA text", "Tech texts when he leaves his last job, with a live ETA"],
            ["act", "Confirmation sent", "SMS + email · reminder 1 h before"],
          ],
          say: "You're booked for today, 4 to 6 PM. Marco will text you when he's on his way.",
          card: { title: "Booked · Today 4–6 PM", meta: "Job #J-2287", pill: "Confirmed", tone: "ok", rows: [["Technician", "Marco"], ["Diagnostic visit", "$89 · waived with repair"], ["Heads-up", "ETA text when he leaves"]] },
        },
        { from: "event", say: "Today · 3:48 PM", wait: 900 },
        {
          trace: [
            ["check", "Marco's route", "Left previous job 3:46 · 3.1 mi · 12 min"],
            ["act", "ETA text sent", "Live ETA link · updates if traffic changes"],
          ],
          say: "Marco just left his last job and is about **12 minutes** away.",
        },
      ],
      next: ["followup", "reschedule", "late"],
    },
    tomorrow: {
      ask: "Tomorrow 8–10 AM",
      keys: ["tomorrow", "tomorrow morning", "8-10", "8–10", "8 am", "first thing", "first stop", "next morning", "early morning", "dana", "make it tomorrow", "tmrw", "tmr", "tomorow"],
      beats: [
        {
          trace: [
            ["act", "Booked · Job #J-2287", "Tomorrow 8–10 AM · Dana · AC not cooling"],
            ["check", "Dana's route", "Your home is her first stop · leaves the shop 7:40"],
            ["rule", "ETA text", "Tech texts when she heads out, with a live ETA"],
            ["act", "Confirmation sent", "SMS + email · reminder tonight at 7 PM"],
          ],
          say: "Done, tomorrow 8 to 10 AM with Dana. You're her first stop, and she'll text you an ETA when she heads out.",
          card: { title: "Booked · Tomorrow 8–10 AM", meta: "Job #J-2287", pill: "Confirmed", tone: "ok", rows: [["Technician", "Dana"], ["Diagnostic visit", "$89 · waived with repair"], ["Heads-up", "ETA text when she leaves"]] },
        },
      ],
      next: ["followup", "reschedule", "price"],
    },
    followup: {
      ask: "The tech came by. I'll think about the quote.",
      chip: "I'll think about the quote",
      keys: ["quote", "think about it", "thinking", "q-1043", "1043", "not sure yet", "decide", "follow up", "consider", "sleep on it", "mull it over", "check with my partner", "talk it over"],
      beats: [
        {
          trace: [
            ["check", "Quote #Q-1043", "Sent by SMS + email · repair $825 · replace $7,450"],
            ["rule", "No pressure on the day", "First follow-up waits 48 hours"],
            ["act", "Follow-up timer set", "#1 of max 3 · in 48 h"],
          ],
          say: "Of course, no rush. Your quote is in your email and right here. I'll check in once in a couple of days.",
          card: { title: "Quote #Q-1043", meta: "From your visit · 2011 R-22 unit", pill: "Sent", tone: "info", rows: [["Repair · capacitor + R-22 leak fix", "$825"], ["Replace · new 3-ton system", "$7,450"], ["Diagnostic visit", "$89 · waived if you go ahead"], ["Valid for", "30 days"]] },
        },
        { from: "event", say: "2 days later · quote #Q-1043 not accepted", wait: 1000 },
        {
          trace: [
            ["check", "Quote status · CRM", "Q-1043 · opened 3×, not accepted · no reply"],
            ["understand", "Likely objection", "Viewed the replace line most · probably price"],
            ["rule", "Max 3 follow-ups", "Stop at once if they say no or STOP"],
            ["act", "Follow-up #1 sent", "SMS · answers price · 2 left"],
          ],
          say: "Hi, just checking in on your quote. If price is the sticking point: the repair alone is **$825**, and if you'd rather replace, there's 0% financing on the new system. Happy to walk through either. Reply STOP and I won't text again.",
          choices: [
            { label: "It's a bit expensive", go: "expensive" },
            { label: "Getting other quotes", go: "compare" },
            { label: "Let's do the repair", go: "approve" },
            { label: "Stop texting me", go: "stop" },
          ],
        },
      ],
      next: ["expensive", "compare", "approve", "stop"],
    },
    expensive: {
      ask: "It's a bit expensive. Is it even worth repairing?",
      chip: "It's a bit expensive",
      keys: ["expensive", "too much", "pricey", "can't afford", "cant afford", "cheaper", "discount", "deal", "financing", "is there financing", "any financing", "monthly payments", "budget", "repair or replace", "fix or replace", "worth fixing", "worth repairing", "old unit", "throwing money"],
      beats: [
        {
          trace: [
            ["understand", "Price objection", "Polite · weighing repair against replace"],
            ["guard", "No made-up discounts", "Prices, financing and offers come from the price book"],
            ["check", "Rule of thumb · $5,000", "Age 15 × repair $825 = $12,375 → replace worth a look"],
            ["check", "Price book · financing", "0% for 18 months over $3,000 · $7,450 ÷ 18 = $414/mo"],
          ],
          say: "Fair, it's a real expense. I can't make up a discount, but here's an honest comparison. The repair gets you cooling again for **$825**, though a 15-year-old R-22 unit often leaks again. Replacing is $7,450, or **$414 a month for 18 months at 0%**. Both are reasonable choices, and we'll do whichever you pick.",
          card: { title: "Repair vs replace", meta: "Quote #Q-1043 · from the price book", pill: "Your call", tone: "info", rows: [["Repair now", "$825"], ["Replace", "$7,450 · or $414/mo × 18 at 0%"], ["Warranty", "90 days · or 10 years"], ["Diagnostic visit", "$89 · waived either way"]], actions: [{ label: "Go with the repair", go: "approve" }, { label: "Look at new systems", go: "replace" }] },
        },
      ],
      next: ["approve", "replace", "compare"],
    },
    approve: {
      ask: "Let's go with the repair.",
      chip: "Go with the repair",
      keys: ["go ahead", "approve", "accept", "let's do it", "lets do it", "do the repair", "book the repair", "go with the repair", "sounds good", "sign", "signed", "accept the quote", "green light"],
      beats: [
        {
          trace: [
            ["act", "Quote #Q-1043 accepted", "Repair · $825 · signed by text"],
            ["check", "Parts + calendar", "Capacitor + R-22 in stock · Thu 8–10 AM open"],
            ["rule", "Diagnostic waived", "$89 credited because we're doing the repair"],
            ["act", "Follow-ups stopped", "2 remaining timers cancelled"],
          ],
          say: "Great, the repair is approved. We'll be there **Thursday 8–10 AM** with the parts, and the $89 diagnostic comes off your bill.",
          card: { title: "Repair booked", meta: "Quote #Q-1043 · Job #J-2291", pill: "Confirmed", tone: "ok", rows: [["When", "Thu 8–10 AM"], ["Repair", "$825"], ["Diagnostic visit", "$89 · waived"]] },
        },
        { from: "event", say: "Thursday · 10:05 AM · job complete", wait: 1000 },
        {
          trace: [
            ["check", "Job #J-2291", "Completed · air 18°F cooler at the vents · paid"],
            ["rule", "Plan offer: once, after", "Only after a finished job, never before or mid-quote"],
            ["check", "Price book · comfort plan", "$15/mo · 2 tune-ups a year · priority booking"],
            ["learn", "Offer logged", "Won't be offered to this customer again"],
          ],
          say: "All done, your AC is cooling again. One thing, and I'll only mention it once: our comfort plan is **$15 a month** for two tune-ups a year and priority booking in heat waves. Older units tend to last longer with it. No need to reply if it's not for you.",
        },
      ],
      next: ["payment", "warranty", "complaint"],
    },
    stop: {
      ask: "Stop texting me.",
      chip: "Stop texting me",
      keys: ["stop", "stop texting", "unsubscribe", "opt out", "opt-out", "no more texts", "leave me alone", "remove me", "don't text", "dont text", "not interested", "quit", "take me off"],
      beats: [
        {
          trace: [
            ["understand", "Opt-out", "STOP request · applies to all texts from us"],
            ["guard", "Honoured instantly", "No more texts, no 'are you sure', no last offer"],
            ["act", "Logged for compliance", "Opt-out · number, time and thread saved"],
            ["act", "Follow-ups cancelled", "Quote #Q-1043 · 2 remaining timers cancelled"],
          ],
          say: "Understood, you won't get any more texts from us. Your quote stays on file if you ever want it, and you can always call the office.",
          card: { title: "Opted out", meta: "Logged for compliance", pill: "No more texts", tone: "ok" },
        },
      ],
    },
    furnace: {
      ask: "The heat isn't coming on.",
      chip: "The heat isn't working",
      keys: ["furnace", "no heat", "heat not working", "heater", "heating", "won't ignite", "not igniting", "won't light", "pilot", "pilot light", "igniter", "cold air from vents", "heat pump", "iced up", "ice on", "icing", "defrost", "aux heat", "house is cold"],
      beats: [
        {
          trace: [
            ["understand", "No heat", "Furnace not lighting, or heat pump icing"],
            ["check", "Customer record", "Gas furnace on file · paired with the 2011 AC"],
            ["guard", "Safe checks only", "Never relight pilots, open panels or touch the gas valve"],
            ["rule", "Gas smell overrides", "Any gas smell → leave the house, emergency steps"],
          ],
          say: "Let's try the safe checks first. For a **furnace**, it's usually the thermostat, the power switch or a clogged filter. For a **heat pump**, a light frost that clears in a few minutes is normal defrost. Solid ice for over an hour means switch it to Aux or Emergency Heat and book us. Please don't chip ice or open any panels.",
          card: { title: "Safe heating checks", meta: "About 5 minutes", pill: "Safe to try", tone: "ok", rows: [["Thermostat", "Set to Heat · 3° above room temp"], ["Furnace switch", "Light-switch near the unit is on · breaker on"], ["Filter + door", "Swap a clogged filter · panel door fully closed"], ["Heat pump ice", "Over 1 hour solid → Aux Heat, then book"]] },
          choices: [
            { label: "Still no heat", go: "book" },
            { label: "I smell gas", go: "emergency" },
          ],
        },
      ],
      next: ["book", "emergency", "plan"],
    },
    leak: {
      ask: "There's water leaking from the indoor unit.",
      chip: "Water leaking inside",
      keys: ["leak", "leaking", "dripping", "drip", "water on the floor", "puddle", "water under", "drain line", "condensate", "drain pan", "overflow", "wet ceiling", "water stain", "soaked"],
      beats: [
        {
          trace: [
            ["understand", "Indoor water leak", "Water around the indoor unit · no mention of sparks"],
            ["rule", "Stop the water first", "System off → protect floor → book same or next day"],
            ["check", "Likely cause", "Clogged condensate drain · most common in summer"],
            ["act", "Job flagged", "Priority 2 · water damage risk · photo requested"],
          ],
          say: "Please turn the system **off at the thermostat** so it stops making water, and put towels or a pan down. It's most often a clogged drain line, which is a quick fix for a tech. If the water is near outlets or wiring, tell me right away.",
          card: { title: "Water leak flagged", meta: "Priority 2 · water damage risk", pill: "System off", tone: "warn", rows: [["Do now", "System off · towels down"], ["Likely cause", "Clogged drain line"], ["Typical fix", "$150–250 · on-site quote first"]] },
          choices: [
            { label: "Book the soonest visit", go: "book" },
            { label: "It's near the wiring", go: "emergency" },
          ],
        },
      ],
      next: ["book", "emergency", "price"],
    },
    noise: {
      ask: "The unit is making a loud grinding noise.",
      chip: "Loud grinding noise",
      keys: ["noise", "noisy", "loud", "grinding", "banging", "rattling", "squealing", "screeching", "buzzing", "humming", "clicking", "clanking", "vibrating", "whistling", "weird sound"],
      beats: [
        {
          trace: [
            ["understand", "Mechanical noise", "Loud grinding · likely motor or fan bearing"],
            ["rule", "Grinding = shut off", "Running it can turn a $300 part into a $1,500 one"],
            ["guard", "No guessing the part", "Tech diagnoses on site · no remote verdict"],
          ],
          say: "Please switch it **off at the thermostat** for now. Grinding usually means a motor or fan bearing, and running it can turn a small repair into a big one. I won't guess which part from here, so let's get a tech to listen to it.",
          card: { title: "Shut off · noise", meta: "Motor or fan suspected", pill: "Book a tech", tone: "warn", rows: [["Do now", "System off at the thermostat"], ["Diagnostic visit", "$89 · waived with repair"]] },
          choices: [
            { label: "Book a visit", go: "book" },
            { label: "It's more of a buzz", go: "diy" },
          ],
        },
      ],
      next: ["book", "price", "warranty"],
    },
    bill: {
      ask: "My energy bill is way up, and the house feels dusty.",
      chip: "High energy bill",
      keys: ["energy bill", "electric bill", "power bill", "utility bill", "high bill", "bill went up", "using more power", "save energy", "filter", "filters", "air filter", "dust", "dusty", "allergies", "air quality", "humidity", "musty", "stuffy", "purifier"],
      beats: [
        {
          trace: [
            ["understand", "High bill + dusty air", "Efficiency and airflow concern · not an outage"],
            ["check", "Customer record", "Last tune-up 2023 · filter size 16×25×1 on file"],
            ["guard", "No savings promises", "Won't quote a dollar figure we can't measure"],
            ["check", "Price book · tune-up", "$129 · coil clean, charge check, airflow test"],
          ],
          say: "Two things usually drive both: a **clogged filter** and a dirty coil. Your filter is **16×25×1**. A MERV 8 to 11, changed every 1 to 3 months, helps with dust too. Your last tune-up was in 2023, so a **$129 tune-up** is worth it. I can't promise a number on the bill, but the tech will show you what they find.",
          card: { title: "Efficiency check", meta: "From your record", pill: "Tune-up due", tone: "info", rows: [["Filter", "16×25×1 · MERV 8–11 · every 1–3 mo"], ["Last tune-up", "2023"], ["Tune-up visit", "$129"]] },
          choices: [
            { label: "Book a tune-up", go: "book" },
            { label: "Tell me about the plan", go: "plan" },
          ],
        },
      ],
      next: ["book", "plan", "replace"],
    },
    replace: {
      ask: "I'm thinking about replacing the whole system.",
      chip: "Replace the system",
      keys: ["replacement", "new system", "new unit", "new ac", "new furnace", "replace the system", "replace my ac", "replace the unit", "whole system", "upgrade", "installation", "install a new", "full system", "how much for a new"],
      beats: [
        {
          trace: [
            ["understand", "Replacement interest", "Whole system · early research stage"],
            ["check", "Customer record", "3-ton R-22 condenser · made 2011"],
            ["rule", "Size it right", "Home size first · exact tonnage from on-site load calc"],
          ],
          say: "Happy to help you think it through. Roughly how big is your home? It decides the system size, and we confirm it properly on site before anything is final.",
          choices: [
            { label: "Under 1,500 sq ft", go: "systype" },
            { label: "1,500–2,500 sq ft", go: "systype" },
            { label: "Over 2,500 sq ft", go: "systype" },
          ],
        },
      ],
      next: ["systype", "expensive", "compare"],
    },
    systype: {
      ask: "What kinds of systems are there, and do any get rebates?",
      chip: "System options",
      keys: ["system options", "which system", "what kind of system", "types of systems", "seer", "seer2", "high-efficiency", "high efficiency", "tonnage", "square feet", "square footage", "rebate", "rebates", "tax credit", "tax credits", "incentive", "incentives", "utility program", "energy star", "federal", "deduction"],
      beats: [
        {
          trace: [
            ["understand", "Home size noted", "Size band saved · current 3-ton is a good baseline"],
            ["check", "Price book · systems", "Standard $7,450 · high-eff. $9,200 · heat pump $10,900"],
            ["check", "Utility program page", "Heat pump + 17 SEER2 AC listed as rebate-qualifying"],
            ["guard", "No tax advice", "Guide prices only · tax credits → their tax preparer"],
          ],
          say: "Based on a 3-ton baseline, here are the three options most homes like yours choose. The **high-efficiency AC** and **heat pump** are on your utility's rebate list, and we fill in the model numbers on the form for you. I can't give tax advice, so for tax credits please check with your tax preparer. Which one sounds closest?",
          card: { title: "System options · 3 ton", meta: "Price book · free estimate confirms", pill: "Guide prices", tone: "info", rows: [["Standard AC · 14 SEER2", "$7,450 · no utility rebate"], ["High-efficiency AC · 17 SEER2", "$9,200 · rebate-listed"], ["Heat pump · heats and cools", "$10,900 · rebate-listed"], ["Warranty · all three", "10 years parts and labor"]] },
          choices: [
            { label: "Standard AC", go: "estimate" },
            { label: "High-efficiency AC", go: "estimate" },
            { label: "Heat pump", go: "estimate" },
          ],
        },
      ],
      next: ["estimate", "compare", "expensive"],
    },
    estimate: {
      ask: "Can someone come give me a proper estimate?",
      chip: "Book a free estimate",
      keys: ["free estimate", "in-home estimate", "home estimate", "proper estimate", "comfort advisor", "priya", "consultation", "come measure", "load calc", "pre-qualify", "prequalify", "credit check", "saturday"],
      beats: [
        {
          trace: [
            ["understand", "Wants exact pricing", "System choice saved · financing question likely"],
            ["check", "Price book · financing", "0% × 18 mo over $3,000: $414 · $511 · $606 a month"],
            ["guard", "No approval promises", "Lender decides credit · soft check doesn't hit score"],
            ["check", "Priya's calendar", "Sat 10 AM · Wed 5:30 PM open"],
          ],
          say: "Here's what the monthly payments look like at **0% for 18 months**, with approved credit. Priya, our comfort advisor, does a free 1-hour visit to measure and give you a fixed price. She has **Saturday 10 AM** or **Wednesday 5:30 PM**.",
          card: { title: "Monthly at 0% · 18 months", meta: "Approved credit · lender decides", pill: "Estimate", tone: "info", rows: [["Standard AC", "$7,450 · $414/mo"], ["High-efficiency AC", "$9,200 · $511/mo"], ["Heat pump", "$10,900 · $606/mo"], ["In-home estimate", "Free · about 1 hour"]] },
        },
        { from: "user", say: "Saturday 10 works.", wait: 600 },
        {
          trace: [
            ["act", "Booked · estimate", "Sat 10 AM · Priya · options + financing pre-check"],
            ["act", "Notes passed on", "Size band, system choice, 2011 unit photo"],
            ["act", "Confirmation sent", "SMS + email · reminder Friday 6 PM"],
          ],
          say: "Booked, **Saturday at 10 AM** with Priya. She'll have your unit photo and the option you picked, so it'll be quick. No obligation at all.",
          card: { title: "Free estimate · Sat 10 AM", meta: "Comfort advisor Priya", pill: "Confirmed", tone: "ok", rows: [["Length", "About 1 hour"], ["Cost", "Free · no obligation"]] },
        },
      ],
      next: ["compare", "reschedule", "_human"],
    },
    warranty: {
      ask: "Is my unit still under warranty?",
      chip: "Is it under warranty?",
      keys: ["warranty", "warranties", "guarantee", "guaranteed", "covered", "coverage", "under warranty", "install date", "when was it installed", "manufacturer", "parts covered", "labor warranty", "registered", "registration"],
      beats: [
        {
          trace: [
            ["understand", "Warranty question", "Existing outdoor unit · not our install"],
            ["check", "Serial lookup", "Made 2011 · registered · 10-yr parts ended 2021"],
            ["check", "Our work · warranty", "Repairs 90 days · new systems 10 years parts + labor"],
            ["guard", "No guessing coverage", "Only what the serial lookup shows"],
          ],
          say: "I checked the serial number from your photo. The unit was made in 2011, and its **10-year parts warranty ended in 2021**, so it's not covered now. Any repair we do has a 90-day warranty, and a new system comes with 10 years on parts and labor.",
          card: { title: "Warranty check", meta: "From serial lookup", pill: "Expired 2021", tone: "warn", rows: [["Manufacturer parts", "Ended 2021"], ["Our repairs", "90 days"], ["New system", "10 years parts + labor"]] },
        },
      ],
      next: ["expensive", "replace", "price"],
    },
    area: {
      ask: "Do you cover my mom's place too?",
      chip: "Do you cover my area?",
      keys: ["service area", "zip", "zip code", "do you cover", "do you serve", "how far", "travel", "my town", "nearby", "location", "miles", "neighborhood", "out of area", "far out"],
      beats: [
        {
          trace: [
            ["understand", "Service-area check", "Second address · needs a ZIP"],
            ["check", "Your address", "ZIP 80227 · Zone 1 · no trip fee"],
            ["rule", "Ask, don't assume", "Check the ZIP before promising a visit"],
          ],
          say: "Your home is well inside our area. What's the ZIP code at your mom's place?",
        },
        { from: "user", say: "It's 80135.", wait: 600 },
        {
          trace: [
            ["check", "Service map", "80135 · 41 mi from the shop · area ends at 30 mi"],
            ["rule", "Out of area", "Polite no + referral, never a visit we can't staff"],
            ["act", "Referral requested", "Office texts 2 licensed local options within the hour"],
          ],
          say: "That one's about **41 miles** out, past our 30-mile area, so we can't promise good response times there. The office keeps a short list of licensed companies we trust in that area and will text you two names within the hour.",
          card: { title: "Service area", meta: "30 miles from the shop", pill: "80135 outside", tone: "warn", rows: [["Your home · 80227", "Covered · no trip fee"], ["Mom's place · 80135", "Outside · referral sent"]] },
        },
      ],
      next: ["book", "commercial", "_human"],
    },
    late: {
      ask: "Where's the tech? It's almost 5.",
      chip: "Where's my tech?",
      keys: ["late", "running late", "where's the tech", "where is the tech", "eta", "on his way", "on the way", "how long until", "still waiting", "no show", "no-show", "hasn't arrived", "not here yet", "tracking", "arrival window", "wheres my guy", "my guy"],
      beats: [
        {
          trace: [
            ["check", "Job #J-2287", "Today 4–6 PM · Marco · not arrived"],
            ["check", "Marco's route · live", "Previous job ran 25 min long · leaving now · 14 min"],
            ["rule", "Honest ETA", "Give the real time, and say so early if the window slips"],
          ],
          say: "Sorry for the wait. Marco's last job ran about 25 minutes long. He's leaving now and should be there around **5:15**, still inside your 4–6 window. Here's his live ETA link.",
          card: { title: "Marco · on the way", meta: "Job #J-2287", pill: "ETA 5:15 PM", tone: "info", rows: [["Window", "4–6 PM"], ["Delay", "About 25 min"]] },
          choices: [
            { label: "That's fine", go: "_thanks" },
            { label: "I need to move it", go: "reschedule" },
          ],
        },
      ],
      next: ["reschedule", "_human"],
    },
    reschedule: {
      ask: "Something came up. Can I cancel or move my visit?",
      chip: "Reschedule or cancel",
      keys: ["reschedule", "cancel", "cancellation", "move my appointment", "change the time", "different time", "different day", "push back", "postpone", "can't make it", "cant make it", "something came up", "rebook", "change my appointment", "reschedule my appointment", "move my visit"],
      beats: [
        {
          trace: [
            ["understand", "Change of plans", "Cancel or move Job #J-2287"],
            ["check", "Cancellation policy", "2+ hours notice → no fee"],
            ["act", "Slot released", "Today 4–6 PM · Marco's route updated"],
          ],
          say: "No problem. I've released your 4–6 PM slot today, and there's no fee since it's more than 2 hours out. Want me to put you in for another time?",
          choices: [
            { label: "Tomorrow 8–10 AM", go: "tomorrow" },
            { label: "No, I'll text later", go: "_bye" },
          ],
        },
      ],
      next: ["tomorrow", "book"],
    },
    payment: {
      ask: "How do I pay, and can I get a copy of my invoice?",
      chip: "Payment and invoice",
      keys: ["invoice", "receipt", "pay my bill", "how do i pay", "pay online", "credit card", "debit", "pay by check", "bank transfer", "payment method", "payment link", "amount due", "balance", "paid", "copy of"],
      beats: [
        {
          trace: [
            ["check", "Job #J-2291", "Repair $825 · diagnostic waived · balance $0"],
            ["guard", "Identity check", "Number matches account · send to email on file only"],
            ["act", "Invoice resent", "PDF to j•••@email on file · SMS link too"],
          ],
          say: "We take card, bank transfer, check, or financing on bigger jobs, and payment is due when the job's done. Your last invoice is **paid in full**. I've sent a copy to the email on file and a link here.",
          card: { title: "Invoice · Job #J-2291", meta: "Sent to the email on file", pill: "Paid", tone: "ok", rows: [["Repair", "$825"], ["Diagnostic visit", "$89 · waived"], ["Balance", "$0"]] },
        },
      ],
      next: ["warranty", "complaint", "plan"],
    },
    complaint: {
      ask: "I'm not happy with the last job.",
      chip: "Problem with a past job",
      keys: ["complaint", "complain", "unhappy", "not happy", "disappointed", "bad job", "poor job", "rude", "left a mess", "still broken", "broke again", "stopped again", "review", "bad review", "refund", "supervisor"],
      beats: [
        {
          trace: [
            ["understand", "Complaint · past job", "Unhappy with work done · tone: upset"],
            ["check", "Job #J-2291", "Repair Thu · 90-day warranty still active"],
            ["guard", "No bot promises", "Refunds, redos and credits are a manager's call"],
            ["person", "Priority to manager", "Sam, service manager · call within the hour"],
          ],
          say: "I'm sorry, that's not how we want to leave anyone. Your repair is still under its **90-day warranty**. I've flagged this as priority for Sam, our service manager, and he'll call you within the hour. Anything you want him to know first?",
          card: { title: "Flagged for the manager", meta: "Job #J-2291 · priority", pill: "Call within 1 h", tone: "handoff" },
        },
        { from: "event", say: "25 minutes later", wait: 900 },
        {
          from: "person",
          who: "Sam · Service manager",
          trace: [["person", "Manager took over", "Sam read the thread + job notes · calling now"]],
          say: "Hi, it's Sam. I've read the notes from Thursday and I'm calling you now. If it needs another look, we'll come back at no charge under the warranty.",
        },
      ],
      next: ["warranty", "_human"],
    },
    plan: {
      ask: "Do you have a maintenance plan?",
      chip: "Maintenance plan",
      keys: ["maintenance plan", "maintenance", "membership", "member", "tune-up", "tune up", "comfort plan", "service plan", "annual service", "checkup", "check-up", "service agreement", "yearly"],
      beats: [
        {
          trace: [
            ["understand", "Asked about the plan", "Customer asked · OK to answer in full"],
            ["rule", "Never pushed", "Only offered once after a job · answer whenever asked"],
            ["check", "Price book · comfort plan", "$15/mo · 2 tune-ups · priority · 10% off repairs"],
          ],
          say: "We do. The comfort plan is **$15 a month**: a cooling tune-up in spring, a heating one in fall, priority booking in heat waves and cold snaps, and 10% off repairs. Cancel anytime. A single tune-up without the plan is $129.",
          card: { title: "Comfort plan", meta: "From the price book", pill: "$15/mo", tone: "info", rows: [["Tune-ups", "2 a year · spring + fall"], ["Priority booking", "Yes"], ["Repairs", "10% off"], ["Commitment", "Cancel anytime"]] },
        },
      ],
      next: ["book", "bill", "payment"],
    },
    commercial: {
      ask: "I manage a few rental properties. Can you handle those?",
      chip: "Rentals or business",
      keys: ["commercial", "business", "office building", "restaurant", "landlord", "rental", "rentals", "tenant", "property manager", "apartment", "multi-unit", "building", "warehouse", "portfolio"],
      beats: [
        {
          trace: [
            ["understand", "Commercial / landlord", "Multiple rental properties · ongoing work"],
            ["rule", "Accounts go to a person", "Commercial and landlord pricing → Jordan, commercial"],
            ["act", "Handed to Jordan", "Thread + property count sent · reply within the hour"],
          ],
          say: "Yes, we work with landlords. Pricing and scheduling for multiple properties are set up by a person, so I've passed this to Jordan on our commercial side. Jordan will text you within the hour.",
          card: { title: "Sent to Jordan", meta: "Commercial accounts", pill: "Within the hour", tone: "handoff" },
        },
        { from: "event", say: "40 minutes later", wait: 900 },
        {
          from: "person",
          who: "Jordan · Commercial accounts",
          trace: [["person", "Jordan took over", "Will build a per-property maintenance schedule"]],
          say: "Hi, Jordan here. How many properties, and roughly where? I'll put together one schedule and one invoice for all of them.",
        },
      ],
      next: ["area", "plan"],
    },
    compare: {
      ask: "I want to get a couple of other quotes first.",
      chip: "Getting other quotes",
      keys: ["other quotes", "second opinion", "shop around", "shopping around", "other companies", "another company", "competitor", "competitors", "other bids", "lower bid", "not ready", "next season", "next year", "wait a while", "hold off", "not right now", "few months"],
      beats: [
        {
          trace: [
            ["understand", "Comparing / timing", "Shopping around · not a no"],
            ["guard", "Never knock competitors", "Help them compare fairly · no comments on others"],
            ["check", "Quote #Q-1043", "Valid 30 days · repair $825 · replace $7,450"],
            ["rule", "Pause follow-ups", "Next check-in in 14 days · STOP still ends it"],
          ],
          say: "That's smart for a purchase this size. Your quote is good for **30 days**. To compare fairly, check the same tonnage and SEER2 rating, the warranty on parts and labor, and whether permits and old refrigerant removal are included. If you need to wait, the $825 repair can keep you cooling in the meantime.",
          card: { title: "Comparing quotes", meta: "Quote #Q-1043 · valid 30 days", pill: "Fair compare", tone: "info", rows: [["Same size", "3 ton · same SEER2"], ["Warranty", "Parts and labor, how many years"], ["Included", "Permit · old refrigerant removal"]] },
          choices: [
            { label: "Do the repair for now", go: "approve" },
            { label: "Stop texting me", go: "stop" },
          ],
        },
      ],
      next: ["approve", "expensive", "stop"],
    },
  },
  fallback: {
    beats: [
      {
        trace: [
          ["understand", "No confident match", "Not a repair, price, booking or quote question"],
          ["guard", "Don't guess", "Unclear questions go to the office, not a made-up answer"],
          ["act", "Sent to the office", "Office texts back within the hour"],
        ],
        say: "I'm not sure about that one, and I'd rather not guess. I've passed it to the office and they'll text you back within the hour. Anything on your system, a price or a visit I can help with now?",
      },
    ],
  },
  capped: {
    beats: [
      {
        trace: [
          ["guard", "Monthly cap reached", "$30 of $30 used → assistant paused"],
          ["act", "Routed to the office", "Message saved for the team"],
          ["person", "A person replies", "Within the hour, same thread"],
        ],
        from: "event",
        say: "Assistant paused · the office will text back within the hour",
      },
    ],
  },
});

(window.AI_CASES ||= []).push({
  id: "leads",
  site: "aegis-leados-pipeline.webp",
  domain: "app.aegisleados.com",
  tab: "Lead gen",
  icon: "radar",
  name: "Aegis",
  status: "Territorial intelligence · ready",
  accent: "#e9b44c",
  who: "You're the owner. You give the orders and approve every send.",
  pitch: "AegisLeadOS takes one order, like 'capture 10 med spas in New York', finds the businesses, walks each website like a customer, diagnoses the revenue leak and drafts the outreach. A person approves every send.",
  plan: "Your Google Places key, plus your Claude or Codex plan",
  budget: { spent: 18.6, cap: 50, per: 0.02 },
  brief: "An AI lead engine for my business that finds prospects, diagnoses their revenue leak and drafts outreach I approve",
  team: "you",
  replyBy: "when you approve",
  greeting: [
    { say: "Give me one order, like **capture 10 med spas in New York**. I'll find them, walk their websites, diagnose the leak and draft the outreach. Nothing sends until you approve it." },
  ],
  start: ["capture", "roofers", "pipeline", "bulk"],
  menu: ["dentists", "estimate", "score", "rescore", "channels", "followup", "pricing", "optout", "export", "limit", "dedupe", "_privacy"],
  topics: {
    capture: {
      ask: "Capture 10 med spas in New York.",
      chip: "Capture 10 med spas in New York",
      keys: ["capture", "med spa", "medspa", "new york", "nyc", "manhattan", "find", "grab", "pull", "new leads", "more leads", "find leads", "sweep", "hunt", "get me", "aesthetics", "botox clinics", "new order"],
      beats: [
        {
          trace: [
            ["understand", "Capture order", "Count: 10 · type: Med Spa · area: New York, NY"],
            ["check", "Cost estimate", "~10 Places lookups · est. $0.32 on your key"],
            ["check", "Budget left", "$18.60 of $50 used this month"],
            ["guard", "Confirm before billing", "No Places call until you launch"],
          ],
          say: "Ready to capture 10 Med Spas in New York, NY. This bills your Google Places key. Confirm to launch.",
          card: {
            title: "Sweep · Med Spas · New York, NY",
            meta: "10 businesses · site walk + scoring",
            pill: "Needs your OK",
            tone: "draft",
            rows: [["Places lookups", "~10 · est. $0.32"], ["AI site walks", "~10 · est. $0.14"], ["Area", "New York city limits"], ["Billed to", "Your Google Places and AI keys"]],
            actions: [{ label: "Launch sweep", go: "sweep" }, { label: "What does it cost?", go: "estimate" }, { label: "Cancel", go: "cancel" }],
          },
        },
      ],
      next: ["sweep", "estimate", "cancel"],
    },
    sweep: {
      ask: "Launch sweep.",
      chip: "Launch sweep",
      keys: ["launch", "run it", "confirm", "do it", "launch sweep", "go ahead", "kick it off", "start sweep", "fire it off", "start the sweep", "run the sweep"],
      beats: [
        {
          trace: [
            ["person", "You launched it", "Sweep confirmed · billing allowed"],
            ["check", "Places · Text Search", "\"med spa\" · New York, NY · 10 results"],
            ["check", "Places · Details × 10", "Ratings, reviews, sites · $0.32 billed"],
            ["check", "Websites", "9 of 10 list a website"],
          ],
          say: "Found 10. Nine have a website I can walk.",
          card: {
            title: "Found · Med Spas · New York, NY",
            meta: "Showing 5 of 10",
            pill: "10 found",
            tone: "info",
            rows: [
              ["Med spa · Upper East Side", "4.8 stars · 600 reviews · site"],
              ["Med spa · Tribeca", "4.6 stars · 212 reviews · site"],
              ["Med spa · Midtown", "4.2 stars · 341 reviews · site"],
              ["Med spa · Williamsburg", "4.9 stars · 88 reviews · site"],
              ["Med spa · Astoria", "4.7 stars · 54 reviews · no site"],
            ],
          },
        },
        {
          trace: [
            ["act", "Site walk · 9 sites", "Visited as a customer would, phone first"],
            ["check", "Upper East Side", "\"Book now\" opens a phone number · loads in 6.8s"],
            ["check", "Inquiry form", "Submits, but no confirmation or reply time"],
            ["check", "Pricing and links", "No prices listed · /pricing link broken"],
          ],
          say: "Walking each website like a customer: is there a way to book, how fast it loads on a phone, what happens after an inquiry, are prices listed, and is anything broken.",
        },
        {
          trace: [
            ["rule", "Scoring", "High demand + high friction → top of the list"],
            ["act", "Scored 9 sites", "7 qualify at 60+ · 2 below · 1 skipped, no site"],
            ["act", "Top reason", "92: no online booking, 4.8 stars with 600 reviews"],
            ["guard", "Sweep cost", "$0.32 Places + $0.14 AI · stopped at 10"],
          ],
          say: "Scored. **7 of 10 qualify.** The top one is Med spa · Upper East Side at 92: 600 happy reviewers and no way to book online. That's demand they can't capture.",
          card: {
            title: "Top leads",
            meta: "Scored on demand vs. friction",
            pill: "7 qualified",
            tone: "ok",
            rows: [
              ["92 · Med spa · Upper East Side", "No online booking · 4.8 stars, 600 reviews"],
              ["84 · Med spa · Tribeca", "7.2s to load on a phone · 212 reviews"],
              ["79 · Med spa · Midtown", "Inquiry form errors on submit"],
            ],
            actions: [{ label: "Show the leak", go: "leak" }, { label: "Explain the score", go: "score" }, { label: "Draft outreach", go: "draft" }],
          },
        },
      ],
      next: ["leak", "score", "draft", "export"],
    },
    leak: {
      ask: "What's the leak at the Upper East Side one?",
      chip: "Show the leak",
      keys: ["leak", "diagnose", "diagnosis", "problem", "what's wrong", "whats wrong", "revenue", "losing", "evidence", "proof", "top lead", "show the leak", "slow", "mobile", "load time", "screenshots", "site walk", "what did you see", "mobile speed", "page speed", "contact form", "booking flow", "missing prices", "walkthrough"],
      beats: [
        {
          trace: [
            ["understand", "Diagnose top lead", "Med spa · Upper East Side · 92/100"],
            ["check", "Reviews", "4.8 stars · 600 reviews · 9 mention \"hard to book\""],
            ["check", "Site walk", "Phone-only booking · no after-hours path"],
            ["guard", "Only what it saw", "No made-up revenue figure in the diagnosis"],
          ],
          say: "Plain version: people love them and want in, but the only way to book is to call. After hours, everyone ready to book has nowhere to go.",
          card: {
            title: "Revenue leak · Med spa · Upper East Side",
            meta: "Score 92/100",
            pill: "Booking gap",
            tone: "warn",
            rows: [
              ["Demand", "4.8 stars from 600 reviews"],
              ["Booking", "Phone only, no online booking"],
              ["Mobile", "6.8s to load on a phone"],
              ["After hours", "Inquiry form gives no confirmation"],
              ["Pricing", "None listed · /pricing link broken"],
            ],
          },
        },
        {
          trace: [
            ["check", "Mobile test · 4G phone", "6.8s to first screen · 3.1 MB of hero images"],
            ["check", "Booking path", "\"Book now\" → tel: link · no calendar anywhere"],
            ["guard", "No fake inquiries", "Form checked to its submit response, nothing sent to them"],
            ["act", "Evidence saved", "4 screenshots + timings attached to the lead"],
          ],
          say: "And here's the walk itself, step by step, so you can check it before you pitch it.",
          card: {
            title: "Site walk · Med spa · Upper East Side",
            meta: "Walked Tue 9:12 AM · phone first",
            pill: "4 screenshots",
            tone: "info",
            steps: { list: ["Home", "Book now", "Inquiry form", "Prices"], at: 3 },
            rows: [
              ["Home on a phone", "6.8s · hero images not compressed"],
              ["Book now", "Opens the phone dialer, closes 7 PM"],
              ["Inquiry form", "Blank page after submit, no reply time"],
              ["Prices", "None on site · /pricing returns 404"],
            ],
            actions: [{ label: "Draft outreach", go: "draft" }, { label: "Explain the score", go: "score" }],
          },
        },
      ],
      next: ["draft", "score", "channels"],
    },
    score: {
      ask: "Explain the 92. And why is it above Tribeca?",
      chip: "Explain the score",
      keys: ["score", "scores", "scoring", "92", "84", "breakdown", "explain the score", "how did you score", "compare", "comparison", "versus", "vs", "which is better", "ranking", "ranked", "points", "side by side", "weights"],
      beats: [
        {
          trace: [
            ["understand", "Score + compare", "Upper East Side 92 vs Tribeca 84"],
            ["rule", "Your weights", "Demand 40 · Friction 35 · Mobile 15 · Fit 10"],
            ["check", "Upper East Side", "38 + 34 + 12 + 8 = 92"],
            ["check", "Tribeca", "31 + 30 + 14 + 9 = 84"],
          ],
          say: "Upper East Side wins on demand: 600 reviewers against 212, and booking is phone only. Tribeca's site is slower, but they do have online booking, so less is slipping through. I'd lead with Upper East Side and pitch Tribeca on speed.",
          card: {
            title: "Score breakdown",
            meta: "Upper East Side · Tribeca",
            pill: "92 vs 84",
            tone: "info",
            rows: [
              ["Demand (40)", "38 · 31"],
              ["Friction (35)", "34 · 30"],
              ["Mobile (15)", "12 · 14"],
              ["Fit (10)", "8 · 9"],
              ["Total", "92 · 84"],
            ],
            actions: [{ label: "Show the evidence", go: "leak" }, { label: "Re-score Tribeca", go: "rescore" }],
          },
        },
      ],
      next: ["leak", "rescore", "draft"],
    },
    rescore: {
      ask: "Tribeca just fixed their site. Re-score them.",
      chip: "Re-score after a site change",
      keys: ["rescore", "re-score", "re score", "rewalk", "re-walk", "check again", "updated their site", "fixed their site", "new site", "changed their site", "refresh", "recheck", "walk it again", "redesign"],
      beats: [
        {
          trace: [
            ["act", "Re-walked 1 site", "Med spa · Tribeca · $0.014 on your AI key"],
            ["check", "What changed", "Phone load 7.2s → 2.4s · booking now 2 taps"],
            ["act", "Re-scored", "31 + 22 + 3 + 9 = 65 · was 84"],
            ["guard", "Stale draft pulled", "Old draft cited the 7.2s load · no longer true"],
          ],
          say: "They did fix it: 2.4 seconds on a phone, down from 7.2. Score drops from 84 to **65**, so they still qualify, just lower down. I pulled the old draft because it mentioned the slow load, and rewrote it around what's still missing: prices.",
          card: {
            title: "Re-scored · Med spa · Tribeca",
            meta: "Walked again just now",
            pill: "84 → 65",
            tone: "warn",
            rows: [["Mobile", "2.4s · fixed"], ["Booking", "2 taps · fixed"], ["Prices", "Still none listed"], ["Draft", "Rewritten · waiting for you"]],
          },
        },
      ],
      next: ["score", "pipeline", "draft"],
    },
    draft: {
      ask: "Draft the outreach for them.",
      chip: "Draft outreach",
      keys: ["draft", "write", "email", "outreach", "pitch them", "reach out", "contact them", "cold email", "write to them", "first email", "intro email", "write it up"],
      beats: [
        {
          trace: [
            ["check", "Public contact", "Front-desk address listed on their own site"],
            ["act", "Drafted email", "Leads with their reviews · one fix · one ask"],
            ["rule", "Tone", "Helpful, specific, no hype · under 120 words"],
            ["guard", "Human gate", "Nothing sends without your approval"],
          ],
          say: "Here's the draft. It names one thing they can check themselves and asks for 15 minutes.",
          card: {
            title: "Draft · Med spa · Upper East Side",
            meta: "To: front desk (public address on their site)",
            pill: "Waiting for you",
            tone: "draft",
            rows: [
              ["Subject", "600 reviews, and no way to book online"],
              ["Opening", "Your reviews are some of the best on the Upper East Side."],
              ["The leak", "Booking is phone only, so after-hours visitors leave."],
              ["Ask", "Worth a 15-minute call to show the fix?"],
              ["Words", "112"],
            ],
            actions: [{ label: "Approve & send", go: "approve" }, { label: "Edit tone", go: "edit" }, { label: "Try another channel", go: "channels" }, { label: "Skip lead", go: "skip" }],
          },
        },
      ],
      next: ["approve", "edit", "channels", "skip"],
    },
    edit: {
      ask: "Make it shorter and warmer.",
      chip: "Edit tone",
      keys: ["edit", "tone", "shorter", "warmer", "rewrite", "softer", "friendlier", "too long", "redo", "more direct", "blunter", "less salesy", "more casual", "more formal", "punchier", "reword", "tweak"],
      beats: [
        {
          trace: [
            ["understand", "Edit tone", "Shorter and warmer · same facts"],
            ["act", "Rewrote draft", "112 words → 64 · kept the one fix and the ask"],
            ["act", "Direct option", "Also wrote a 31-word version, no compliment"],
            ["guard", "Back to you", "The edited draft still needs your approval"],
          ],
          say: "Shorter and warmer. Same facts, same ask. I put a more direct version underneath in case that's more you.",
          card: {
            title: "Draft v2 · Med spa · Upper East Side",
            meta: "To: front desk (public address on their site)",
            pill: "Waiting for you",
            tone: "draft",
            rows: [
              ["Subject", "Loved reading your reviews"],
              ["Body", "600 reviews at 4.8 stars is rare. One thing: booking is phone only."],
              ["Ask", "Could I show you a quick fix? 15 minutes, your call."],
              ["Words", "64"],
              ["Direct option", "Your booking is phone only. I can fix that. 15 minutes?"],
            ],
            actions: [{ label: "Approve & send", go: "approve" }, { label: "Back to the original", go: "draft" }, { label: "Skip lead", go: "skip" }],
          },
        },
      ],
      next: ["approve", "draft", "skip"],
    },
    channels: {
      ask: "Should I email them, call, or send a note?",
      chip: "Email, call or a note?",
      keys: ["channel", "channels", "call or email", "phone them", "linkedin", "social", "direct message", "which channel", "best way to reach", "short note", "text them", "sms", "instagram", "dm them", "message them"],
      beats: [
        {
          trace: [
            ["check", "Public contact · UES", "Front-desk email, main phone, business social page"],
            ["rule", "Your order", "Email first · call if no reply in a week"],
            ["guard", "Your accounts", "Never posts or DMs from your social accounts"],
            ["guard", "No cold texts", "Won't text a business number without consent"],
          ],
          say: "Email is the best fit here: their front desk lists a public address. A call script is ready if you'd rather phone, and I wrote a short note you can copy into their business page yourself. Texting is off the table.",
          card: {
            title: "Channels · Med spa · Upper East Side",
            meta: "Public business contact only",
            pill: "Email first",
            tone: "info",
            rows: [
              ["Email", "Front-desk address · draft ready"],
              ["Call", "Main line · weekdays 10–4 · script ready"],
              ["Social note", "38 words · you copy and send it"],
              ["Text", "Not offered · no cold texts"],
            ],
          },
          choices: [{ label: "Use the email", go: "draft" }, { label: "Give me the call script", go: "callscript" }],
        },
      ],
      next: ["draft", "callscript"],
    },
    callscript: {
      ask: "Give me the call script.",
      chip: "Call script",
      keys: ["call script", "script", "cold call", "phone script", "what do i say", "talking points", "calling", "dial", "voicemail", "gatekeeper", "ring them", "phone call"],
      beats: [
        {
          trace: [
            ["check", "Their hours", "Mon–Sat 10 AM–7 PM, listed on their site"],
            ["rule", "Call window", "Weekdays 10–11:30 or 2–4, never the first hour"],
            ["act", "Script drafted", "About 30 seconds · one fix · voicemail version"],
            ["guard", "You dial", "Aegis never places calls for you"],
          ],
          say: "Thirty seconds, one fix, one ask. Best window is mid-morning or mid-afternoon on a weekday, when the front desk isn't slammed.",
          card: {
            title: "Call script · Med spa · Upper East Side",
            meta: "Main line on their site",
            pill: "For you to call",
            tone: "draft",
            rows: [
              ["Opener", "Hi, quick one about your website, not a sales list."],
              ["The leak", "600 great reviews, but booking is phone only."],
              ["Ask", "Could I show the owner a fix in 15 minutes?"],
              ["If busy", "Ask for the best email for the owner's desk."],
              ["If no", "Thank them, and I log it as not interested."],
              ["Voicemail", "Same three lines, plus your name and number."],
            ],
          },
        },
      ],
      next: ["draft", "followup", "optout"],
    },
    approve: {
      ask: "Approve & send.",
      chip: "Approve & send",
      keys: ["approve", "send it", "approved", "looks good", "ship it", "ok send", "aprove", "send now", "hit send", "lgtm", "good to go", "send the email"],
      beats: [
        {
          trace: [
            ["person", "You approved", "Read and sent by you · Tue 9:40 AM"],
            ["act", "Sent", "From your sending address · 1 of 25 today"],
            ["act", "Board updated", "Med spa · Upper East Side → Sent"],
            ["rule", "Follow-up", "One follow-up Fri 9:40 AM · stops on reply or unsubscribe"],
          ],
          say: "Sent and logged on the board. If they don't reply, one follow-up goes Friday morning, and it stops the moment they reply or unsubscribe.",
          card: {
            title: "Med spa · Upper East Side",
            meta: "Sent Tue 9:40 AM",
            pill: "Sent",
            tone: "ok",
            steps: { list: ["Captured", "Qualified", "Drafted", "Sent", "Replied", "Meeting"], at: 3 },
            rows: [["Follow-up", "Fri 9:40 AM, once"], ["Stops on", "Reply or unsubscribe"]],
          },
        },
      ],
      next: ["reply", "followup", "pipeline"],
    },
    followup: {
      ask: "How do follow-ups work? Add a second one.",
      chip: "Follow-up rules",
      keys: ["follow up", "follow-up", "followup", "follow ups", "nudge", "chase", "bump", "second email", "reminder email", "cancel the follow-up", "no response", "ghosted", "didn't reply", "didnt reply", "how many follow"],
      beats: [
        {
          trace: [
            ["check", "Current rule", "1 follow-up after 3 days · stops on reply, unsubscribe or bounce"],
            ["act", "Added a second", "Day 7 · applies to new sends only"],
            ["guard", "Max two", "Never a third, never after an opt-out"],
            ["rule", "Approved up front", "You approve follow-up text with the first email"],
          ],
          say: "Done: first email, a follow-up on day 3, a last one on day 7, then it stops for good. Any reply, unsubscribe or bounce stops it straight away. You'll see the follow-up text when you approve the first email.",
          card: {
            title: "Follow-up rules",
            meta: "New sends from today",
            pill: "Max 2",
            tone: "ok",
            steps: { list: ["First email", "Day 3", "Day 7", "Stop"], at: 0 },
            rows: [["Stops on", "Reply, unsubscribe or bounce"], ["Already sent", "Keep their current schedule"], ["Never", "A third follow-up"]],
          },
        },
      ],
      next: ["optout", "limit", "pipeline"],
    },
    skip: {
      ask: "Skip this lead.",
      chip: "Skip lead",
      keys: ["skip", "pass", "not this one", "next lead", "ignore", "drop", "no thanks", "nah", "not a fit", "pass on", "move on"],
      beats: [
        {
          trace: [
            ["act", "Lead skipped", "Upper East Side → Skipped · nothing sent"],
            ["learn", "Asks why next time", "Your skip reasons tune future scoring"],
            ["check", "Next in line", "Med spa · Tribeca · 84"],
          ],
          say: "Skipped, nothing was sent. Next in line is Med spa · Tribeca at 84: their site takes 7.2 seconds to load on a phone.",
        },
      ],
      next: ["score", "pipeline", "capture"],
    },
    reply: {
      ask: "Any replies yet?",
      chip: "Fast-forward to a reply",
      keys: ["reply", "replies", "response", "answered", "wrote back", "heard back", "inbox", "any news", "replys", "responded", "new reply", "did they respond"],
      beats: [
        { from: "event", say: "Thursday · 11:20 AM", wait: 900 },
        {
          trace: [
            ["check", "Inbox", "New reply on the Upper East Side thread"],
            ["understand", "Intent · positive", "Wants a call · asks for Tuesday"],
            ["act", "Follow-up cancelled", "Friday follow-up stopped · they replied"],
            ["act", "Board updated", "Med spa · Upper East Side → Replied"],
          ],
          say: "They wrote back, and it's a yes to talking.",
          card: {
            title: "Reply from Med spa · UES",
            meta: "Thursday · 11:20 AM",
            pill: "Positive",
            tone: "ok",
            rows: [["Message", "\"Interesting, can you call Tuesday?\""], ["Intent", "Wants a call"]],
          },
        },
        {
          trace: [
            ["check", "Your calendar · Tue", "10:00 AM, 1:30 PM, 4:00 PM free"],
            ["act", "Drafted reply", "Thanks them · offers 3 times · 41 words"],
            ["guard", "Human gate", "Waits for your approval, like every send"],
          ],
          say: "I drafted a reply with three Tuesday times from your calendar.",
          card: {
            title: "Draft reply · Med spa · UES",
            meta: "Re: 600 reviews, and no way to book online",
            pill: "Waiting for you",
            tone: "draft",
            rows: [["Body", "Glad it landed. Tuesday works. Would any of these suit?"], ["Times", "10:00 AM · 1:30 PM · 4:00 PM"]],
            actions: [{ label: "Approve & send reply", go: "book" }, { label: "Not yet", go: "pipeline" }],
          },
        },
      ],
      next: ["book", "pricing", "optout"],
    },
    book: {
      ask: "Approve & send the reply.",
      chip: "Send the reply",
      keys: ["send reply", "approve reply", "tuesday", "book the call", "book a call", "propose times", "send the times", "meeting", "calendar", "set up the call", "book it in"],
      beats: [
        {
          trace: [
            ["person", "You approved", "Reply read and sent by you · Thu 11:34 AM"],
            ["act", "Sent", "Same thread · 2 of 25 today"],
            ["rule", "When they pick", "Chosen time goes on your calendar · board → Meeting"],
          ],
          say: "Sent. When they pick a time it goes straight on your calendar, and the board moves them to Meeting.",
          card: {
            title: "Med spa · Upper East Side",
            meta: "Call proposed · Tue",
            pill: "Replied",
            tone: "ok",
            steps: { list: ["Captured", "Qualified", "Drafted", "Sent", "Replied", "Meeting"], at: 4 },
          },
        },
      ],
      next: ["pipeline", "capture"],
    },
    pricing: {
      ask: "A prospect asked what it costs.",
      chip: "A reply asks for pricing",
      keys: ["pricing", "asked about price", "asks for pricing", "price question", "quote", "rates", "fees", "your prices", "price sheet", "how much do you charge", "packages", "what do you charge"],
      beats: [
        { from: "event", say: "Wednesday · 2:10 PM", wait: 700 },
        {
          trace: [
            ["check", "Inbox", "Reply from Salon · Jersey City Heights (Monday's sweep)"],
            ["understand", "Intent · pricing", "\"What would something like this cost?\""],
            ["check", "Your price sheet", "Booking fix from $1,500 · care plan $90/month"],
            ["guard", "Your prices only", "No discounts, no custom quotes, no guessed scope"],
          ],
          say: "Salon · Jersey City Heights wants a price. I drafted an answer from your price sheet only: the starting price, what changes it, and an offer to scope it on a call.",
          card: {
            title: "Draft reply · Salon · Jersey City Heights",
            meta: "Re: your booking page on a phone",
            pill: "Waiting for you",
            tone: "draft",
            rows: [
              ["Price", "Booking fix starts at $1,500"],
              ["Ongoing", "Optional care plan, $90 a month"],
              ["Depends on", "Pages, payments, and how many staff calendars"],
              ["Ask", "15 minutes this week to scope it properly?"],
            ],
          },
        },
        { from: "user", say: "Looks right. Send it." },
        {
          trace: [
            ["person", "You approved", "Read and sent by you · Wed 2:16 PM"],
            ["act", "Sent", "Same thread · follow-up paused, they're talking"],
            ["act", "Board updated", "Salon · Jersey City Heights → Replied · pricing sent"],
          ],
          say: "Sent. Their follow-up is paused since they're in conversation, and the board shows pricing went out.",
        },
      ],
      next: ["optout", "followup", "pipeline"],
    },
    optout: {
      ask: "Someone replied that they're not interested.",
      chip: "A prospect says no",
      keys: ["not interested", "unsubscribe", "unsubscribed", "opt out", "opt-out", "opted out", "remove us", "take us off", "stop emailing", "do not contact", "leave us alone", "said no", "declined", "rejected"],
      beats: [
        { from: "event", say: "Wednesday · 3:05 PM", wait: 700 },
        {
          trace: [
            ["check", "Inbox", "Reply from Salon · Downtown Jersey City"],
            ["understand", "Intent · decline", "\"Not interested, please take us off your list.\""],
            ["act", "Follow-up cancelled", "Thursday follow-up stopped before it sent"],
            ["act", "Do-not-contact", "Address + domain added · 14 on your list"],
          ],
          say: "Salon · Downtown Jersey City said no and asked to be removed. Done: their follow-up is cancelled and they're on your do-not-contact list, so no future sweep will ever draft to them.",
          card: {
            title: "Salon · Downtown Jersey City",
            meta: "Wed 3:05 PM",
            pill: "Do not contact",
            tone: "alert",
            rows: [["Board", "Closed · not interested"], ["Follow-up", "Cancelled"], ["Future sweeps", "Excluded by domain"]],
          },
        },
        {
          trace: [
            ["rule", "No reply to opt-outs", "No \"sorry to bother you\" email, nothing more"],
            ["rule", "Unsubscribe link", "One click does exactly the same, instantly"],
            ["learn", "Reason logged", "Already happy with their booking · tunes salon scoring"],
          ],
          say: "I didn't reply to them. An opt-out means nothing more goes out, not even a goodbye. Anyone who clicks unsubscribe gets the same treatment, instantly.",
        },
      ],
      next: ["pipeline", "followup", "export"],
    },
    limit: {
      ask: "Can we send 100 a day instead of 25?",
      chip: "Raise the daily send limit",
      keys: ["limit", "daily limit", "send limit", "per day", "a day", "100", "more sends", "raise the limit", "quota", "throttle", "deliverability", "warm up", "sending cap", "maxed out", "hit the limit"],
      beats: [
        {
          trace: [
            ["check", "Today", "2 of 25 sent from your address"],
            ["rule", "Daily cap", "25 per sending address · protects your domain"],
            ["guard", "Not from chat", "Raising it is a setting you change, with a warm-up"],
            ["rule", "At 25", "Further approvals queue for 9:00 AM next day"],
          ],
          say: "I'll keep it at 25. Jumping to 100 cold emails a day is how a domain ends up in spam folders. If you do want more, raise it in Settings and it climbs 5 a day so inbox providers get used to you. When you hit the cap, approved emails just wait until 9 AM.",
          card: {
            title: "Sending · your address",
            meta: "Today",
            pill: "2 of 25",
            tone: "info",
            rows: [["Sent today", "2"], ["At 25", "Queued for 9:00 AM tomorrow"], ["To raise it", "Settings → Sending · +5 a day"], ["Opt-outs", "Never sent, whatever the limit"]],
          },
        },
      ],
      next: ["bulk", "followup", "pipeline"],
    },
    roofers: {
      ask: "Capture 5 roofers in Austin.",
      chip: "Capture 5 roofers in Austin",
      keys: ["roofer", "roofers", "roofing", "austin", "texas", "contractors", "roof repair", "atx", "5 roofers", "roof", "storm damage"],
      beats: [
        {
          trace: [
            ["understand", "Capture order", "Count: 5 · type: Roofer · area: Austin, TX"],
            ["check", "Cost estimate", "~5 Places lookups · est. $0.16 on your key"],
            ["rule", "Chains", "Franchises go to a separate list, not outreach"],
            ["guard", "Confirm before billing", "No Places call until you launch"],
          ],
          say: "Got it: 5 Roofers in Austin, TX. About $0.23 all in. Confirm to launch.",
          card: {
            title: "Sweep · Roofers · Austin, TX",
            meta: "5 businesses · site walk + scoring",
            pill: "Needs your OK",
            tone: "draft",
            rows: [["Places lookups", "~5 · est. $0.16"], ["AI site walks", "~5 · est. $0.07"], ["Area", "Austin city limits"], ["Chains", "Set aside, not contacted"]],
            actions: [{ label: "Launch Austin sweep", go: "roofsweep" }, { label: "Cancel", go: "cancel" }],
          },
        },
      ],
      next: ["roofsweep", "estimate", "cancel"],
    },
    roofsweep: {
      ask: "Launch the Austin sweep.",
      chip: "Launch Austin sweep",
      keys: ["launch austin", "austin sweep", "franchise", "franchises", "chain", "chains", "corporate", "multi location", "national brand", "head office", "headquarters", "locations"],
      beats: [
        {
          trace: [
            ["person", "You launched it", "Sweep confirmed · billing allowed"],
            ["check", "Places · Text Search", "\"roofer\" · Austin, TX · 5 results · $0.16"],
            ["rule", "Chain found", "Roofing · North Austin · 38 locations → Chains list"],
            ["act", "Walked + scored 4", "$0.06 · 3 qualify at 60+ · 1 below"],
          ],
          say: "Found 5. One is a franchise with 38 locations, so per your rule it went to the Chains list instead of outreach: those decisions get made at head office. Of the 4 I walked, **3 qualify**.",
          card: {
            title: "Top leads · Roofers · Austin, TX",
            meta: "Scored on demand vs. friction",
            pill: "3 qualified",
            tone: "ok",
            rows: [
              ["88 · Roofing · South Austin", "Quotes by phone only · 4.7 stars, 310 reviews"],
              ["74 · Roofing · Round Rock", "Storm-damage page is a 404"],
              ["66 · Roofing · Pflugerville", "5.9s to load on a phone"],
              ["52 · Roofing · Cedar Park", "Below 60 · instant quote form works"],
              ["Set aside · Roofing · North Austin", "Franchise, 38 locations"],
            ],
            actions: [{ label: "Export to CSV", go: "export" }, { label: "Show the pipeline", go: "pipeline" }],
          },
        },
      ],
      next: ["export", "pipeline", "dentists"],
    },
    dentists: {
      ask: "Find dentists in Miami.",
      chip: "Find dentists in Miami",
      keys: ["dentist", "dentists", "dental", "miami", "florida", "orthodontist", "dental office", "dental clinics", "teeth", "brickell"],
      beats: [
        {
          trace: [
            ["understand", "Capture order", "Type: Dentist · area: Miami, FL · count: missing"],
            ["check", "Area size", "~140 dentists on the map inside Miami"],
            ["guard", "Don't guess", "No sweep without a count · 140 would cost ~$6.50"],
          ],
          say: "Miami has about 140 dentists on the map, and I'd rather not guess how many you want. How many, and how close to which part of town?",
          choices: [{ label: "5 within 3 miles of Brickell", go: "refine" }, { label: "Cancel", go: "cancel" }],
        },
      ],
      next: ["refine", "cancel"],
    },
    refine: {
      ask: "Make it 5 within 3 miles of Brickell, 4.0 stars and up, with a website, open now.",
      chip: "Change count, radius or filters",
      keys: ["radius", "miles", "within", "closer", "wider", "widen", "narrow", "min rating", "rating", "stars", "4.0", "has website", "with a website", "no website", "without a website", "open now", "filter", "filters", "only ones", "change the count"],
      beats: [
        {
          trace: [
            ["understand", "Order changed", "5 · 3 mi of Brickell · 4.0+ stars · has website · open now"],
            ["guard", "\"Open now\" swapped", "Means open this minute · used \"operating, not closed\""],
            ["check", "Cost estimate", "~5 Places lookups $0.16 · ~5 walks $0.07"],
            ["guard", "Confirm before billing", "No Places call until you launch"],
          ],
          say: "Updated. One change: \"open now\" would only catch whoever's open this minute, so I filtered to businesses that are operating instead. If you ever want ones that need a website, flip that filter to \"no website\".",
          card: {
            title: "Sweep · Dentists · Miami, FL",
            meta: "5 businesses · site walk + scoring",
            pill: "Needs your OK",
            tone: "draft",
            rows: [["Area", "3 miles around Brickell"], ["Min rating", "4.0 stars"], ["Website", "Must have one"], ["Status", "Operating, not closed"], ["Est. cost", "$0.16 Places + $0.07 AI"]],
            actions: [{ label: "Launch Miami sweep", go: "keyguard" }, { label: "Cancel", go: "cancel" }],
          },
        },
      ],
      next: ["keyguard", "cancel"],
    },
    keyguard: {
      ask: "Launch the Miami sweep.",
      chip: "Launch Miami sweep",
      keys: ["launch miami", "miami sweep", "places key", "api key", "key missing", "invalid key", "key error", "key expired", "403", "rotate key", "rotated", "google key", "key not working", "new key"],
      beats: [
        {
          trace: [
            ["person", "You launched it", "Sweep confirmed · billing allowed"],
            ["check", "Places · Text Search", "403 · API key not valid"],
            ["guard", "Stopped at first error", "0 lookups made · $0.00 billed"],
            ["guard", "Keys stay in Settings", "Never shown or asked for in chat"],
          ],
          say: "Stopped before anything billed: Google rejected your Places key. It's usually expired, restricted, or billing is off on that project. Update it in **Settings → Keys** and I'll pick the order back up.",
          card: {
            title: "Places key rejected",
            meta: "Order saved · Dentists · Miami, FL",
            pill: "Nothing billed",
            tone: "alert",
            rows: [["Error", "403 · key not valid"], ["Lookups made", "0"], ["Billed", "$0.00"], ["Fix", "Settings → Keys"]],
          },
        },
        { from: "user", say: "Rotated the key. Try again." },
        {
          trace: [
            ["check", "Key test · 1 call", "OK · Places API enabled"],
            ["check", "Places · Text Search", "17 match the filters · took the 5 closest · $0.16"],
            ["rule", "Dedupe", "Dental · Brickell already on your board → not added"],
            ["act", "Walked + scored 4", "$0.06 · 3 qualify at 60+"],
          ],
          say: "Key works. Found 5. One was already on your board from September, so I left it alone. Of the other 4, **3 qualify**.",
          card: {
            title: "Top leads · Dentists · Miami, FL",
            meta: "3 miles around Brickell · 4.0+ stars",
            pill: "3 qualified",
            tone: "ok",
            rows: [
              ["86 · Dental · Coral Way", "No online booking · 4.9 stars, 410 reviews"],
              ["77 · Dental · Little Havana", "Reviews in Spanish, site in English only"],
              ["68 · Dental · Downtown", "Contact form gives no reply time"],
              ["Already on board · Dental · Brickell", "Emailed Sep 19 · no reply"],
            ],
            actions: [{ label: "Why not Brickell?", go: "dedupe" }, { label: "Export to CSV", go: "export" }],
          },
        },
      ],
      next: ["dedupe", "export", "pipeline"],
    },
    dedupe: {
      ask: "Why didn't you add the Brickell one?",
      chip: "Duplicate lead rule",
      keys: ["duplicate", "duplicates", "dupe", "dedupe", "already in", "already on", "twice", "same lead", "repeat", "re-contact", "recontact", "already contacted", "contacted before"],
      beats: [
        {
          trace: [
            ["check", "Board · Dental · Brickell", "Captured Sep 18 · emailed Sep 19 · follow-up Sep 22 · no reply"],
            ["rule", "One business, one record", "Matched on Place ID + domain · never captured twice"],
            ["rule", "Cool-off", "No new outreach for 90 days after last send"],
            ["act", "Reminder set", "Eligible again Dec 21 · you decide then"],
          ],
          say: "It's already on your board from the September sweep: emailed Sep 19, followed up Sep 22, no reply. One business gets one record, and nobody hears from you again for 90 days after the last email. They're eligible on **Dec 21**, and I'll remind you then.",
          card: {
            title: "Dental · Brickell",
            meta: "On your board since Sep 18",
            pill: "Cool-off",
            tone: "warn",
            rows: [["Last email", "Sep 22 · follow-up"], ["Reply", "None"], ["Eligible again", "Dec 21"]],
          },
        },
      ],
      next: ["export", "pipeline", "followup"],
    },
    estimate: {
      ask: "How much does a sweep cost me?",
      chip: "What does a sweep cost?",
      keys: ["cost", "how much", "estimate", "per lead", "per sweep", "expensive", "billed", "my bill", "cheap", "have i spent", "spent this month", "money", "costs", "used this month"],
      beats: [
        {
          trace: [
            ["check", "Your rates", "Places $0.032 per business · AI walk ~$0.014 per site"],
            ["check", "This month", "$18.60 of $50 used · $31.40 left"],
            ["act", "Worked out", "10-lead sweep ≈ $0.46 · ~68 more at that size"],
            ["guard", "Hard cap", "At $50 everything pauses · never billed past it"],
          ],
          say: "About **4.6 cents a lead**. A 10-lead sweep runs about $0.46: $0.32 for the Places lookups and $0.14 for the site walks. With $31.40 left this month, that's around 68 more sweeps of 10 before the cap.",
          card: {
            title: "Cost per sweep",
            meta: "On your own keys",
            pill: "$31.40 left",
            tone: "info",
            rows: [["Places lookup", "$0.032 each"], ["AI site walk", "~$0.014 each"], ["10-lead sweep", "~$0.46"], ["This month", "$18.60 of $50"]],
            actions: [{ label: "Capture 10 med spas in New York", go: "capture" }],
          },
        },
      ],
      next: ["capture", "roofers", "pipeline"],
    },
    export: {
      ask: "Export these leads to a CSV.",
      chip: "Export to CSV",
      keys: ["export", "csv", "spreadsheet", "download", "crm", "sync", "push to", "send to my crm", "table", "sheet", "import", "backup"],
      beats: [
        {
          trace: [
            ["act", "CSV built", "10 rows · NYC med spas · 11 columns"],
            ["guard", "Business info only", "No personal names, emails or phone numbers"],
            ["rule", "Do-not-contact", "Opted-out businesses marked, never listed as leads"],
            ["check", "CRM", "None connected · Settings → Integrations"],
          ],
          say: "Here's the file. No CRM is connected yet, so it's a CSV for now; once you connect one in Settings, qualified leads sync there as new deals.",
          card: {
            title: "leads-nyc-medspas.csv",
            meta: "Ready to download",
            pill: "10 rows",
            tone: "ok",
            rows: [["Columns", "Name, area, rating, reviews, site, score, leak, stage…"], ["Contact", "Public business address only"], ["Opt-outs", "Excluded"], ["CRM", "Not connected"]],
          },
        },
      ],
      next: ["pipeline", "capture"],
    },
    cancel: {
      ask: "Cancel.",
      chip: "Cancel",
      keys: ["cancel", "never mind", "nevermind", "not now", "hold off", "call it off", "scrap it", "forget it", "don't launch", "cancel sweep", "stop the sweep"],
      beats: [
        {
          trace: [
            ["understand", "Cancel the sweep", "Before launch"],
            ["guard", "Nothing billed", "0 Places calls made · $0.00"],
            ["act", "Order cleared", "Nothing saved to the board"],
          ],
          say: "Cancelled. No lookups ran and nothing was billed. Give me a new order whenever you're ready.",
        },
      ],
      next: ["capture", "roofers", "pipeline"],
    },
    bulk: {
      ask: "Just email every med spa in New York.",
      chip: "Email everyone in New York",
      keys: ["everyone", "every", "all of them", "bulk", "blast", "mass email", "spam", "scrape", "personal email", "personal emails", "owner's email", "cell number", "mailing list", "buy a list", "email everyone", "all med spas", "every med spa", "blast every", "auto send", "autopilot", "without approving"],
      beats: [
        {
          trace: [
            ["understand", "Bulk send request", "Every med spa in NYC · no review step"],
            ["guard", "Public contact only", "Business addresses on their own sites, no personal emails"],
            ["guard", "Approval per send", "Never sends in bulk without a person reading each"],
            ["rule", "Limits", "25 sends a day per address · opt-outs never contacted"],
          ],
          say: "I won't do that one. I only use public business contact details, I never contact anyone who opted out, and every email gets read and approved by you before it goes, up to 25 a day. Want me to capture the best 10 instead?",
          choices: [{ label: "Capture 10 med spas in New York", go: "capture" }],
        },
      ],
      next: ["capture", "limit", "pipeline"],
    },
    pipeline: {
      ask: "Show the pipeline.",
      chip: "Show the pipeline",
      keys: ["pipeline", "board", "status", "overview", "stages", "how many", "kanban", "dashboard", "pipline", "this week", "weekly", "results", "report", "statistics", "numbers"],
      beats: [
        {
          trace: [
            ["check", "Board · NYC med spas", "10 captured · 7 qualified · 3 skipped"],
            ["check", "Sends", "1 sent · 6 drafts waiting for you"],
            ["check", "Replies", "1 reply · positive · call proposed Tue"],
          ],
          say: "Every lead and every reply, on one board.",
          card: {
            title: "Pipeline · Med Spas · New York, NY",
            meta: "This week",
            pill: "1 reply",
            tone: "info",
            rows: [
              ["Captured", "10"],
              ["Qualified (60+)", "7"],
              ["Skipped", "3 · 2 low score, 1 no site"],
              ["Drafts waiting for you", "6"],
              ["Sent", "1"],
              ["Replied", "1 · call proposed Tue"],
            ],
          },
        },
        {
          trace: [
            ["check", "All orders · this week", "NYC med spas (10) + Jersey City salons (8, Monday)"],
            ["check", "Outcomes", "7 sent · 3 replies · 1 opt-out · 0 bounces"],
            ["check", "Spend", "$0.83 on sweeps this week · $18.60 this month"],
          ],
          say: "And across everything this week: 3 replies from 7 sends.",
          card: {
            title: "This week · all orders",
            meta: "Mon–Thu",
            pill: "3 replies",
            tone: "ok",
            rows: [
              ["Captured", "18 · 12 qualified"],
              ["Sent", "7 · 1 NYC, 6 Jersey City"],
              ["Replies", "3 · 1 call, 1 pricing, 1 not interested"],
              ["Sweep spend", "$0.83"],
            ],
            actions: [{ label: "Export to CSV", go: "export" }],
          },
        },
      ],
      next: ["reply", "pricing", "export"],
    },
    _human: {
      ask: "Can I talk to a real person?",
      keys: ["real person", "human", "talk to someone", "speak to someone", "representative", "live person"],
      beats: [
        {
          trace: [
            ["understand", "Asked for a person", "The owner is the person in this loop"],
            ["rule", "Human in the loop", "Nothing launches, bills or sends without you"],
          ],
          say: "That's you. I find, walk, score and draft; you decide. Nothing launches, bills or sends until you say so. For help with the app itself, use **Help → Contact support**.",
        },
      ],
      next: ["pipeline", "capture"],
    },
    _bot: {
      ask: "Are you an AI?",
      keys: ["bot", "are you a bot", "are you ai", "are you an ai", "are you real", "is this ai", "robot", "automated", "chatbot"],
      beats: [
        {
          trace: [
            ["understand", "Asked what it is", "Answer plainly"],
            ["guard", "Honest", "AI drafts · you approve and send under your name"],
          ],
          say: "Yes, I'm the AI side of AegisLeadOS. Every email that goes out is one you read and approved, from your address.",
        },
      ],
      next: ["capture", "pipeline"],
    },
    _privacy: {
      ask: "Whose data is this, and where does it live?",
      chip: "Whose data is this?",
      keys: ["privacy", "my data", "whose data", "gdpr", "personal data", "data stored", "where is the data", "where does it live", "stored where", "legal", "compliance", "personal info", "is it safe", "who sees"],
      beats: [
        {
          trace: [
            ["guard", "Public business info only", "Places listings + their own websites · no personal emails"],
            ["check", "Where it's stored", "Your account and your machine · not shared or sold"],
            ["rule", "Opt-outs kept", "Do-not-contact list kept so they're never emailed again"],
            ["guard", "Your keys", "Stay in Settings · never shown in chat"],
          ],
          say: "Only public business info: their map listing, their own website, and the contact address they publish. No personal emails or numbers. It lives in your account and on your machine, isn't shared or sold, and the do-not-contact list is kept so anyone who opts out stays out.",
        },
      ],
      next: ["export", "bulk", "pipeline"],
    },
    _angry: {
      ask: "These leads are useless.",
      keys: ["useless", "garbage", "terrible", "awful", "frustrated", "annoyed", "this sucks", "rubbish", "waste of time", "bad leads"],
      beats: [
        {
          trace: [
            ["understand", "Frustrated with lead quality", "Fix the inputs, not the tone"],
            ["act", "Nothing sent", "Drafts held · no new sweeps"],
            ["learn", "Logged", "Feedback tunes scoring for your next order"],
          ],
          say: "Fair, let's fix it. Nothing more goes out until you're happy. Usually it's the filters or the weights: tighten who I look for, or let me show you exactly why each one scored high.",
          choices: [{ label: "Tighten the filters", go: "refine" }, { label: "Explain the scores", go: "score" }],
        },
      ],
      next: ["refine", "score"],
    },
  },
  fallback: {
    beats: [
      {
        trace: [
          ["understand", "No order found", "Missing a count, a business type or a city"],
          ["guard", "Don't guess", "No sweep runs on a half-understood order"],
        ],
        say: "I need an order in this shape: **capture N type in city**, like \"capture 10 med spas in New York\". I'll confirm the cost before anything runs.",
        choices: [{ label: "Capture 10 med spas in New York", go: "capture" }, { label: "Capture 5 roofers in Austin", go: "roofers" }],
      },
    ],
  },
  capped: {
    beats: [
      {
        trace: [
          ["guard", "Budget cap reached", "$50 of $50 used on your Places and AI keys"],
          ["act", "Sweep paused", "No further lookups · nothing more billed"],
          ["person", "Your call", "Raise the cap or wait for next month to resume"],
        ],
        from: "event",
        say: "Sweep paused · budget cap reached, nothing more will be billed",
      },
    ],
  },
});

(window.AI_CASES ||= []).push({
  id: "studio",
  site: "ai-studio.webp",
  domain: "app.studio-autopilot.com",
  billing: "plan",
  tab: "Content studio",
  icon: "play",
  name: "Autopilot",
  status: "Running · 3 channels",
  accent: "#a3e635",
  who: "You run a small content studio. Autopilot makes and posts the videos.",
  pitch: "Spots what's trending, writes and renders the video, posts at peak hours, and learns from the views.",
  plan: "On the client's existing Claude or Codex plan",
  budget: { spent: 74.4, cap: 120, per: 0.006 },
  brief: "An AI autopilot for my content studio that finds trends, writes and renders short videos, and posts them at peak hours",
  team: "Sam, your editor",
  replyBy: "before it posts",
  greeting: [
    { say: "Afternoon. Today's pick is ready: **Silent walking** mornings, up 340% this week. Want to see why, or should I just make it?" },
  ],
  start: ["trend", "make", "script", "stats"],
  menu: ["week", "series", "repurpose", "voice", "comments", "dms", "flop", "report", "pause", "channel", "banned", "delete"],
  topics: {
    // ---------- Owner overrides of the common topics ----------
    _human: {
      ask: "Get Sam on this.",
      chip: "Bring in Sam",
      keys: ["sam", "editor", "real person", "a human", "talk to someone", "get someone", "loop in", "escalate", "my team", "check with sam"],
      beats: [
        {
          trace: [
            ["understand", "Owner wants a person", "Hand this thread to Sam, the editor"],
            ["act", "Thread sent", "Chat, script and queue attached for Sam"],
            ["rule", "Hold while with Sam", "Anything in this thread waits for his OK"],
            ["person", "Sam notified", "Push + email · usually replies within 30 min"],
          ],
          say: "Sent to Sam with the script and this chat. He'll look before it posts, and nothing in this thread goes out until he does.",
          card: { title: "With Sam", meta: "Editor review", pill: "Before it posts", tone: "handoff" },
        },
      ],
      next: ["script", "week"],
    },
    _angry: {
      ask: "I'm not happy with how these videos are coming out.",
      chip: "I'm not happy with these",
      keys: ["not happy", "unhappy", "terrible", "awful", "hate it", "hate these", "embarrassing", "cringe", "garbage", "worst", "annoyed", "frustrated", "fed up"],
      beats: [
        {
          trace: [
            ["understand", "Owner unhappy", "Quality complaint · no single video named"],
            ["act", "Auto-post paused", "Morning Walks · nothing new posts until you restart"],
            ["person", "Sam flagged · priority", "Last 5 videos + this chat sent for review"],
            ["guard", "Nothing deleted", "Posted videos stay up unless you say otherwise"],
          ],
          say: "Understood. I've **paused auto-post** on Morning Walks, so nothing new goes out, and sent Sam the last five videos to look at with you. What feels off: the tone, the topics, or the look?",
          card: { title: "Auto-post paused", meta: "Morning Walks", pill: "With Sam", tone: "handoff", rows: [["Paused", "Fri 3:50 PM"], ["Queued", "2 videos held as drafts"], ["Restart", "You or Sam"]] },
          choices: [{ label: "The tone is off", go: "voice" }, { label: "Just talk to Sam", go: "_human" }],
        },
      ],
      next: ["voice", "look", "_human"],
    },
    _privacy: {
      ask: "Who owns the footage? Is any of it used to train AI?",
      chip: "Who owns my footage?",
      keys: ["privacy", "my data", "footage", "who owns", "ownership", "train", "training", "trained on", "data stored", "where is it stored", "own the videos"],
      beats: [
        {
          trace: [
            ["check", "Workspace storage", "Footage, scripts, voice files · your studio workspace"],
            ["rule", "You own it all", "Every script, render and clip belongs to the studio"],
            ["guard", "No public training", "Runs on your Claude or Codex plan · not used to train public models"],
            ["check", "Access list", "You and Sam · nobody else"],
          ],
          say: "It's all yours: footage, scripts, renders and voice files stay in your workspace, and only you and Sam can open them. It runs on your own Claude or Codex plan, so **nothing trains public models**. You can export or delete everything from Settings.",
        },
      ],
      next: ["connect", "voiceover"],
    },
    _bot: {
      ask: "Wait, am I talking to a bot?",
      chip: "Are you a bot?",
      keys: ["bot", "robot", "are you ai", "are you real", "is this ai", "automated", "machine", "a script"],
      beats: [
        {
          trace: [
            ["understand", "Identity question", "Owner asking what's on the other end"],
            ["rule", "Always honest", "Autopilot never claims to be a person"],
          ],
          say: "Yes, I'm AI: the autopilot that runs your channels. Sam is the real person on your side, and anything risky goes to him or you before it posts.",
        },
      ],
      next: ["_human", "week"],
    },

    // ---------- Today's video ----------
    trend: {
      ask: "What's trending in my niche today?",
      chip: "What's trending today?",
      keys: ["trend", "trending", "niche", "popular", "viral", "hot right now", "today's pick", "idea", "ideas", "what should we make", "what to post"],
      beats: [
        {
          trace: [
            ["check", "Trend scan", "Search, short-video feeds, forums · +340% this week"],
            ["check", "Competition", "Low · 38 videos on the topic so far"],
            ["check", "Brand fit", "92/100 · calm, outdoors, practical"],
            ["guard", "Safety check", "Not breaking news, no health claim → OK to make"],
          ],
          say: "**Silent walking** in the mornings. Searches are up 340% this week, only 38 videos cover it, and it fits your channel almost perfectly.",
          card: {
            title: "Silent walking · mornings",
            meta: "Picked from 3 sources",
            pill: "+340% this week",
            tone: "ok",
            rows: [["Sources", "Search, short-video feeds, forums"], ["Competition", "Low · 38 videos"], ["Fit to brand", "92 / 100"], ["Safety", "Passed"]],
          },
          choices: [{ label: "Make it", go: "make" }, { label: "Skip it, what else?", go: "others" }],
        },
      ],
      next: ["make", "others", "script"],
    },
    others: {
      ask: "Skip it, what else is trending?",
      chip: "What else is trending?",
      keys: ["else", "others", "skip it", "something else", "what else", "different idea", "alternatives", "next idea", "off brand", "off-brand", "dance", "challenge"],
      beats: [
        {
          trace: [
            ["check", "Trend scan", "4 more candidates above +200% this week"],
            ["guard", "Health claim", "\"Walk off anxiety in 10 min\" · +510% → skipped"],
            ["guard", "Breaking tragedy", "Trail accident story · +900% → skipped"],
            ["rule", "Fit under 60 → skip", "Walking dance challenge · fit 31 → off-brand"],
          ],
          say: "Three bigger trends came up and I skipped all of them: one makes a health claim, one is a breaking tragedy, and the dance challenge doesn't fit a calm channel (fit 31). The best clean one is already lined up for tomorrow.",
          card: {
            title: "Other trends this week",
            rows: [["3 mistakes on a silent walk", "Fit 88 · queued Sat"], ["Walk off anxiety in 10 min", "Skipped · health claim"], ["Trail accident story", "Skipped · breaking news"], ["Walking dance challenge", "Skipped · off-brand, fit 31"]],
            pill: "3 skipped",
            tone: "warn",
          },
          choices: [{ label: "Make the anxiety one anyway", go: "health" }, { label: "Go back to silent walking", go: "make" }],
        },
      ],
      next: ["health", "make", "channel"],
    },
    health: {
      ask: "Make the anxiety one anyway, it's huge.",
      chip: "Make the anxiety one anyway",
      keys: ["anxiety", "anyway", "health claim", "cure", "cures", "stress", "medical", "tragedy", "accident", "breaking news", "do it anyway", "override"],
      beats: [
        {
          trace: [
            ["understand", "Override request", "Make the skipped \"walk off anxiety\" trend"],
            ["guard", "No health claims", "Studio rule: no medical claims, no breaking tragedies"],
            ["rule", "Changed in settings, not chat", "Brand-safety rules need the owner's settings page"],
            ["act", "Offered a safe angle", "Calm walk routine, no promises about anxiety"],
          ],
          say: "I won't make content off breaking tragedies or health claims, even when they're trending. That rule lives in your brand settings, so you can change it there. What I can do is a calm morning-walk routine with **no promises about anxiety**.",
          card: { title: "Trend skipped", meta: "Walk off anxiety in 10 min", pill: "Health claim", tone: "alert", rows: [["Reason", "Medical claim, no source"], ["Logged", "Trend log · Fri 3:44 PM"]] },
        },
      ],
      next: ["make", "banned", "trend"],
    },
    make: {
      ask: "Make today's video.",
      chip: "Make today's video",
      keys: ["make it", "make today's", "create", "produce", "render", "today's video", "make the video", "build it", "just make", "start it"],
      beats: [
        {
          trace: [
            ["understand", "Make today's video", "Pick: Silent walking · fit 92/100"],
            ["act", "Script written", "40s · 118 words · tone calm, direct"],
            ["act", "3 drafts scored", "Best hook score 8.7 → draft 2 picked"],
            ["rule", "Hook in the first 2s", "Draft 2's hook lands at 1.6s"],
          ],
          say: "Script's done. I wrote 3 drafts and kept the strongest hook (8.7). It opens at 1.6s with **\"Stop doing this on your morning walk.\"**",
          card: {
            title: "Script · Silent walking",
            meta: "40s · 118 words · calm, direct",
            rows: [["Hook · 1.6s", "Stop doing this on your morning walk."], ["Then", "No podcast. No phone."], ["Then", "Twenty minutes, in silence."]],
          },
        },
        {
          trace: [
            ["guard", "Brand voice check", "118 words vs. your style guide · 0 flagged phrases"],
            ["guard", "Claims check", "No health, money or safety promises"],
            ["rule", "Clean → auto-post", "This channel auto-posts when nothing is flagged"],
          ],
          say: "Brand voice check passed, nothing flagged, so it doesn't need a review.",
        },
        {
          trace: [
            ["act", "Rendering 3 cuts", "A main · B alt hook · C 15s cutdown"],
            ["check", "Format", "1080×1920 · captions burned in"],
            ["check", "AI plan", "3 renders + 1.4 voiceover min on the plan"],
          ],
          say: "Rendering three versions now.",
          card: {
            title: "Rendering · Silent walking",
            pill: "Rendering",
            tone: "info",
            steps: { list: ["Script", "Voice check", "Render", "Auto-QA", "Scheduled"], at: 2 },
            rows: [["A", "Main cut · 40s"], ["B", "Alt hook · 40s"], ["C", "15s cutdown"]],
          },
        },
        {
          trace: [
            ["check", "Captions", "Synced to voice on all 3 cuts"],
            ["check", "Loudness", "−14 LUFS · A, B and C"],
            ["check", "Frames", "1080×1920 · no black or frozen frames"],
          ],
          say: "All three passed QA: captions in sync, audio at −14 LUFS.",
        },
        {
          trace: [
            ["check", "Audience heatmap", "Morning Walks peaks Fri 7–8 PM"],
            ["rule", "Post at peak", "Schedule to the strongest slot this week"],
            ["act", "Scheduled", "A + B at 7:30 PM as a hook test · C held"],
          ],
          say: "Scheduled for **Fri 7:30 PM**, the peak on your audience heatmap. A and B go out together so we can see which hook holds people longer.",
          card: {
            title: "Scheduled · Fri 7:30 PM",
            pill: "Peak hour",
            tone: "ok",
            steps: { list: ["Script", "Voice check", "Render", "Auto-QA", "Scheduled"], at: 4 },
            rows: [["Why 7:30 PM", "Your audience peaks Fri 7–8 PM"], ["Posting", "A + B · hook test"], ["Held", "C for a 15s repost"], ["Human time", "0 min"]],
          },
        },
      ],
      next: ["stats", "look", "song"],
    },
    script: {
      ask: "Show me the script first.",
      chip: "Show me the script first",
      keys: ["script", "see it first", "review it", "let me see", "check it first", "preview", "read it", "draft", "before posting", "approve first", "hold it", "scirpt"],
      beats: [
        {
          trace: [
            ["understand", "Review before posting", "Owner wants to see the script"],
            ["rule", "Auto-post, flagged → review", "Client chose auto-post; anything flagged goes to review"],
            ["guard", "Brand voice check", "0 flagged phrases · 118 words"],
            ["act", "Held for you", "Render waits until you approve"],
          ],
          say: "Here it is. This channel is on auto-post and nothing's flagged, but I'll hold it since you asked.",
          card: {
            title: "Script · Silent walking",
            meta: "40s · 118 words · calm, direct · hook score 8.7",
            pill: "Waiting for you",
            tone: "draft",
            rows: [["Hook · 1.6s", "Stop doing this on your morning walk."], ["Then", "No podcast. No phone."], ["Then", "Twenty minutes, in silence."]],
          },
          choices: [{ label: "Approve it", go: "approve" }, { label: "Add a line", go: "edit" }],
        },
      ],
      next: ["approve", "edit", "voice"],
    },
    approve: {
      ask: "Looks good, approve it.",
      chip: "Approve it",
      keys: ["approve", "approved", "looks good", "go ahead", "ship it", "post it", "sounds good", "green light", "lgtm", "perfect", "love it"],
      beats: [
        {
          trace: [
            ["person", "Approved by you", "Script · Silent walking · Fri 3:46 PM"],
            ["act", "Sent to render", "A main · B alt hook · C 15s cutdown"],
            ["check", "Posting slot", "Fri 7:30 PM · channel peak"],
          ],
          say: "Approved. It's rendering now and goes out at **7:30 PM** tonight. I'll tell you how it does.",
          card: { title: "Approved · Silent walking", pill: "Posts 7:30 PM", tone: "ok", steps: { list: ["Script", "Voice check", "Render", "Auto-QA", "Scheduled"], at: 2 } },
        },
      ],
      next: ["stats", "look", "nineam"],
    },
    edit: {
      ask: "Add a line: \"Doctors say it cuts stress in half.\"",
      chip: "Add a line",
      keys: ["edit", "add a line", "change a line", "rewrite", "tweak", "doctors", "cuts stress", "in half", "update the script", "add a stat", "put in a stat", "stat that", "statistic", "source", "fact check", "study says", "citation"],
      beats: [
        {
          trace: [
            ["act", "Line added", "After \"Twenty minutes, in silence.\" · now 125 words"],
            ["guard", "Claims check", "1 flagged phrase · health claim, no source given"],
            ["rule", "Flagged → review", "Auto-post off for this video until a person approves"],
            ["person", "Sam notified", "Editor review requested"],
          ],
          say: "Added, but the claims check flagged it: **\"cuts stress in half\"** is a health claim with no source, and I won't post a stat I can't point to. Flagged scripts go to review, so I've sent it to Sam.",
          card: { title: "Flagged for review", meta: "Script · Silent walking", pill: "With Sam", tone: "handoff", rows: [["Flagged", "Doctors say it cuts stress in half."], ["Why", "Health claim, no source"], ["To clear it", "A named study, or reword"]] },
        },
        { from: "event", say: "Fri 4:12 PM · 24 min later", wait: 900 },
        {
          from: "person",
          who: "Sam · Editor",
          trace: [["person", "Sam edited and approved", "Swapped the claim for a plain-voice line"]],
          say: "Kept your idea, dropped the claim: \"Most people say it's the calmest part of their day.\" Approved.",
        },
        {
          trace: [
            ["guard", "Claims re-check", "0 flagged phrases · 128 words · still 40s"],
            ["act", "Sent to render", "A, B and C with Sam's line"],
            ["check", "Posting slot", "Still Fri 7:30 PM peak"],
          ],
          say: "Sam's version passed the check. Rendering now, still posting at **7:30 PM**.",
        },
      ],
      next: ["stats", "banned", "nineam"],
    },
    song: {
      ask: "Use that viral song everyone's using.",
      chip: "Use the viral song",
      keys: ["song", "music", "track", "audio", "sound", "viral song", "trending sound", "beat", "soundtrack", "background music", "copyright", "licensed", "musci"],
      beats: [
        {
          trace: [
            ["understand", "Music request", "Trending song from short-video feeds"],
            ["guard", "Licensed audio only", "Not in your licensed library → can't use it"],
            ["check", "Licensed library", "3 calm matches · 72–80 BPM"],
            ["act", "Swapped in", "\"Low Morning\" · leveled to −14 LUFS"],
          ],
          say: "I can't use that one. It isn't licensed for your channels, and that's how videos get muted or taken down. I picked a licensed track with the same slow, calm feel.",
          card: { title: "Soundtrack · Silent walking", pill: "Licensed", tone: "ok", rows: [["Track", "Low Morning · library"], ["Feel", "Calm · 76 BPM"], ["Loudness", "−14 LUFS"]] },
        },
      ],
      next: ["look", "voiceover", "stats"],
    },
    look: {
      ask: "Which cover frame are we using? And can the captions look calmer?",
      chip: "Cover frame and captions",
      keys: ["thumbnail", "thumbnails", "cover", "cover frame", "cover image", "frame", "captions", "caption style", "subtitles", "font", "text on screen", "look of it", "thumbnial"],
      beats: [
        {
          trace: [
            ["check", "Cover candidates", "3 frames from cut A · scored on past click-through"],
            ["guard", "No bait covers", "Cover must be a real frame, text must match the video"],
            ["act", "Frame 2 picked", "Feet on the trail + \"No phone.\" · score 8.1"],
          ],
          say: "Frame 2: feet on the trail with **\"No phone.\"** over it. It scored highest, and it's a real moment from the video, never a frame that promises something we don't show.",
          card: { title: "Cover frame · Silent walking", pill: "Frame 2", tone: "ok", rows: [["Frame 1 · 0:02", "Wide trail shot · 6.4"], ["Frame 2 · 0:09", "Feet + \"No phone.\" · 8.1"], ["Frame 3 · 0:31", "Sunrise, no text · 5.9"]] },
        },
        {
          trace: [
            ["understand", "Calmer captions", "Fewer words on screen, softer style"],
            ["act", "Style changed", "White, no box, 2 lines max, no word pop"],
            ["check", "Readability", "Contrast passes on all 3 cuts · safe zones clear"],
            ["learn", "Saved to brand kit", "All 3 channels use it from Sat"],
          ],
          say: "Captions are now plain white, two lines max, no bouncing words. Saved to your brand kit, so every video from Saturday uses it.",
        },
      ],
      next: ["voiceover", "song", "week"],
    },
    voiceover: {
      ask: "Can we change the voiceover? Maybe use my own voice.",
      chip: "Change the voiceover",
      keys: ["voiceover", "voice over", "narrator", "narration", "new voice", "different voice", "male voice", "female voice", "accent", "my own voice", "clone", "read it out", "speaker", "who reads it"],
      beats: [
        {
          trace: [
            ["check", "Current voice", "Library voice \"Calm 2\" · all 3 channels"],
            ["check", "Library", "6 licensed voices · 2 close to your tone"],
            ["guard", "No look-alike voices", "Never imitate a real person or celebrity"],
          ],
          say: "You're on **Calm 2** from the licensed library. I can switch to another library voice now, or use yours. I'll never copy anyone else's voice.",
          card: { title: "Voiceover options", rows: [["Calm 2", "Current · steady, low"], ["Morning 1", "Warmer · slightly faster"], ["Your voice", "Needs a consent recording"]] },
        },
        { from: "user", say: "Use my own voice." },
        {
          trace: [
            ["guard", "Consent first", "Own-voice needs a 2-min consent read from you"],
            ["rule", "Set up in Settings, not chat", "Recorded in Settings → Voice, signed in as you"],
            ["check", "Plan", "Same voiceover minutes · 38 / 120 used"],
            ["act", "Kept Calm 2 for now", "Switches the day your recording is approved"],
          ],
          say: "Happy to. It needs a **2-minute consent recording** from you in Settings → Voice. I can't set that up from chat. Until it's in, videos stay on Calm 2, and it uses the same plan minutes either way.",
        },
      ],
      next: ["voice", "_privacy", "look"],
    },

    // ---------- Performance and learning ----------
    stats: {
      ask: "How's the video doing?",
      chip: "How did the video do?",
      keys: ["views", "how did", "howd it do", "how it did", "performance", "stats", "results", "numbers", "analytics", "did it do", "tonight's video", "retention", "ab test", "a/b", "hook test", "which hook"],
      beats: [
        { from: "event", say: "Fri 7:58 PM · 28 min after posting", wait: 900 },
        {
          trace: [
            ["check", "Views · A", "12.4k in 28 min · 2.3× channel average"],
            ["check", "Views · B", "4.1k in 28 min · alt hook lands at 2.6s"],
            ["rule", "Hook test", "Same video, 2 hooks · winner after 25 min"],
            ["act", "Winner picked", "A gets the boost · B retired"],
          ],
          say: "It's flying. Version A has **12.4k views in 28 minutes**, 2.3× your channel average. B, the same video with a slower hook, is at 4.1k, so A wins the hook test.",
          card: { title: "Silent walking · 28 min in", pill: "2.3× average", tone: "ok", rows: [["Version A", "12.4k views · hook 1.6s"], ["Version B", "4.1k views · hook 2.6s"], ["Posted", "Fri 7:30 PM"], ["Human time", "0 min"]] },
        },
        {
          trace: [
            ["check", "Retention curve", "Hooks under 2s held viewers 31% longer"],
            ["learn", "Rule updated", "Hook capped at 1.8s · no intro card"],
            ["act", "Next idea queued", "\"3 mistakes people make on a silent walk\""],
          ],
          say: "What I learned: hooks under 2 seconds held people **31% longer**, so new scripts cap the hook at 1.8s and skip the intro card. Next up is \"3 mistakes people make on a silent walk\", Sat 7:30 PM.",
        },
      ],
      next: ["series", "flop", "report"],
    },
    flop: {
      ask: "Why did Wednesday's rain video flop?",
      chip: "Why did one video flop?",
      keys: ["flop", "flopped", "underperformed", "underperforming", "bombed", "did badly", "low views", "no views", "rain video", "walking in the rain", "what went wrong", "why so few"],
      beats: [
        {
          trace: [
            ["check", "Walking in the rain", "Wed Oct 14 · 3.1k views · 0.4× your 48-hour average"],
            ["check", "Retention curve", "61% gone by 3s · hook at 3.2s behind an intro card"],
            ["check", "Post time", "2:10 PM after a render retry · off-peak"],
            ["check", "Topic fit", "74 / 100 · lower than this week's picks"],
          ],
          say: "Three things: the hook didn't land until **3.2s**, behind an intro card, so most people left first. It also went out at 2:10 PM after a render retry instead of waiting for the evening peak. And the topic was a weaker fit (74).",
          card: { title: "Walking in the rain", meta: "Wed Oct 14 · Morning Walks", pill: "0.4× average", tone: "warn", rows: [["Views", "3.1k"], ["Lost by 3s", "61%"], ["Hook", "3.2s · after intro card"], ["Posted", "2:10 PM · off-peak"]] },
        },
        {
          trace: [
            ["learn", "Intro cards off", "Morning Walks · hook first, always"],
            ["rule", "Retries wait for peak", "A late render posts at the next peak slot, not ASAP"],
            ["learn", "Fit floor raised", "Picks under 80 go to you first"],
          ],
          say: "What changes: no intro cards, late renders wait for the next peak, and any pick under 80 fit asks you first. Want it gone, or leave it up?",
          choices: [{ label: "Delete it", go: "delete" }, { label: "Leave it, show the month", go: "report" }],
        },
      ],
      next: ["delete", "report", "series"],
    },
    report: {
      ask: "Give me the monthly report.",
      chip: "Monthly report",
      keys: ["report", "monthly", "this month", "month so far", "overview", "summary", "recap", "how are we doing", "october", "followers", "growth", "top video", "best video"],
      beats: [
        {
          trace: [
            ["check", "Posts · Oct 1–16", "44 · Walks 16, Slow Kitchen 15, Quiet Desk 13"],
            ["check", "Views + followers", "1.86M views · +6,240 followers"],
            ["check", "Top and bottom", "Porch reset 410k · Walking in the rain 3.1k"],
            ["check", "Human time", "2h 10m · Sam on 4 flagged scripts"],
          ],
          say: "October so far: **44 videos, 1.86M views, +6,240 followers**, and 2h 10m of human time, all of it Sam on the four flagged scripts. Top video is still the 5-minute porch reset at 410k.",
          card: {
            title: "October · day 16 of 31",
            meta: "All 3 channels",
            pill: "1.86M views",
            tone: "ok",
            rows: [["Videos posted", "44"], ["Followers", "+6,240"], ["Top video", "5-minute porch reset · 410k"], ["Weakest", "Walking in the rain · 3.1k"], ["Trends skipped", "9 · safety or fit"], ["Plan", "124 / 200 renders"], ["Human time", "2h 10m"]],
          },
        },
        {
          trace: [
            ["act", "Full report scheduled", "Nov 1 · 8:00 AM · emailed to you and Sam"],
            ["learn", "Pattern spotted", "How-to angles beat stories 2.1× on all 3 channels"],
          ],
          say: "The full report lands Nov 1 at 8 AM. One pattern worth knowing: practical how-to videos are beating story videos about 2 to 1.",
          choices: [{ label: "Do more like the top one", go: "series" }],
        },
      ],
      next: ["series", "plan", "flop"],
    },
    series: {
      ask: "Turn silent walking into a 3-part series.",
      chip: "Make it a 3-part series",
      keys: ["series", "3-part", "three part", "part 2", "part two", "follow up", "follow-up", "sequel", "reuse", "do it again", "more like", "top performer", "another like it"],
      beats: [
        {
          trace: [
            ["understand", "Series request", "Silent walking · 3 parts · reuse the winner"],
            ["check", "Winning formula", "Hook 1.6s · how-to · 40s · calm, direct"],
            ["check", "Queue", "\"3 mistakes\" already set for Sat → becomes part 2"],
            ["act", "Part 3 written", "\"Your first silent walk\" · 38s · hook 1.4s"],
          ],
          say: "Done. Tonight's video is **part 1**, Saturday's \"3 mistakes\" becomes **part 2**, and I wrote **part 3**, \"Your first silent walk, step by step\", for Monday 7:30 PM.",
          card: {
            title: "Series · Silent walking",
            pill: "3 parts",
            tone: "info",
            rows: [["Part 1 · Fri 7:30 PM", "Stop doing this on your walk · posted"], ["Part 2 · Sat 7:30 PM", "3 mistakes on a silent walk"], ["Part 3 · Mon 7:30 PM", "Your first silent walk"]],
          },
        },
        {
          trace: [
            ["act", "Linked the parts", "End card + pinned comment point to the next part"],
            ["guard", "Brand + claims check", "Parts 2 and 3 · 0 flagged phrases"],
            ["check", "Plan", "+4 renders · 128 / 200 after this"],
          ],
          say: "Each part ends pointing to the next, and both new scripts passed the checks. That's 4 more renders on the plan.",
        },
      ],
      next: ["week", "script", "repurpose"],
    },
    repurpose: {
      ask: "Cut my long headphones video into shorts.",
      chip: "Turn a long video into shorts",
      keys: ["repurpose", "long video", "shorts", "clips", "clip it", "cut it up", "chop", "highlights", "from the long one", "headphones video", "long form", "longform", "cut into"],
      beats: [
        {
          trace: [
            ["check", "Source video", "\"Why I stopped walking with headphones\" · 14:20"],
            ["act", "6 moments found", "Scored on hook, standalone sense, length"],
            ["guard", "No out-of-context cuts", "A clip can't change what you meant · 2 dropped"],
            ["act", "4 clips cut", "28–44s · hook in the first 1.8s"],
          ],
          say: "Found six moments and kept **four**. I dropped two because cut short they'd make you sound like you said something you didn't.",
          card: {
            title: "Shorts from the long video",
            meta: "Why I stopped walking with headphones · 14:20",
            pill: "4 clips",
            tone: "ok",
            rows: [["Clip 1 · 0:42", "The first quiet minute · 34s"], ["Clip 2 · 3:10", "What I started noticing · 41s"], ["Clip 3 · 7:55", "The one exception · 28s"], ["Clip 4 · 11:30", "Try this tomorrow · 44s"], ["Dropped", "2 · meaning changed out of context"]],
          },
        },
        {
          trace: [
            ["rule", "Fill gaps, not peaks", "Clips go on days with no main post"],
            ["act", "Slotted", "Sun, Tue, Thu evenings · clip 4 held"],
            ["check", "Plan", "4 renders · uses your footage, no new voiceover"],
          ],
          say: "They go out Sunday, Tuesday and Thursday evenings around the main posts, with clip 4 held in reserve. No new voiceover needed, it's your own audio.",
          choices: [{ label: "Pick their cover frames", go: "look" }, { label: "Show me the week", go: "week" }],
        },
      ],
      next: ["week", "look", "series"],
    },

    // ---------- Schedule ----------
    nineam: {
      ask: "Post at 9 AM instead.",
      chip: "Post at 9 AM instead",
      keys: ["9 am", "9am", "nine", "morning post", "earlier", "reschedule", "change the time", "post at", "move it to", "timing", "different time", "later slot"],
      beats: [
        {
          trace: [
            ["understand", "Owner override", "Posting time → 9:00 AM from now on"],
            ["check", "Audience heatmap", "9 AM reaches ~40% of the Fri 7:30 PM peak"],
            ["rule", "Owner decides", "Your call beats the data, every time"],
            ["act", "Rescheduled", "\"3 mistakes\" · Sat 7:30 PM → Sat 9:00 AM"],
          ],
          say: "Done. Heads up: your audience at 9 AM is about 40% of the evening peak, but it's your channel. Tomorrow's video now goes out at **Sat 9:00 AM**.",
          card: { title: "Schedule changed", meta: "3 mistakes people make on a silent walk", pill: "Your call", tone: "info", rows: [["Was", "Sat 7:30 PM"], ["Now", "Sat 9:00 AM"], ["Set by", "You"]] },
        },
        {
          trace: [["learn", "Compare after 3 posts", "Report 9 AM vs. 7:30 PM views side by side"]],
          say: "After three morning posts I'll show you how they compare. You can switch back any time.",
        },
      ],
      next: ["week", "plan", "stats"],
    },
    week: {
      ask: "What's posting this week?",
      chip: "This week's schedule",
      keys: ["this week", "schedule", "calendar", "lineup", "line up", "upcoming", "what's posting", "whats posting", "queue", "planned", "posting plan"],
      beats: [
        {
          trace: [
            ["check", "Queue · Morning Walks", "Sat Oct 17 – Fri Oct 23 · 7 posts"],
            ["check", "Other channels", "Slow Kitchen 7 · Quiet Desk 7 · all scripted"],
            ["rule", "Post at peak", "Each slot from that channel's own heatmap"],
            ["check", "Plan", "~7.8 renders a day at this pace"],
          ],
          say: "Seven posts on Morning Walks this week, one a day, each at that day's peak. Slow Kitchen and Quiet Desk have seven each, all scripted and checked.",
          card: {
            title: "This week · Morning Walks",
            meta: "Sat Oct 17 – Fri Oct 23",
            pill: "7 posts",
            tone: "info",
            rows: [["Sat · 7:30 PM", "Series pt 2 · 3 mistakes"], ["Sun · 6:45 PM", "Headphones clip 1"], ["Mon · 7:30 PM", "Series pt 3 · first silent walk"], ["Tue · 7:15 PM", "Headphones clip 2"], ["Wed · 7:30 PM", "Fog walk · 40s"], ["Thu · 7:15 PM", "Headphones clip 3"], ["Fri · 7:30 PM", "Weekly trend pick · chosen Thu"]],
          },
          choices: [{ label: "Move Saturday to 9 AM", go: "nineam" }, { label: "Pause for the holidays", go: "pause" }],
        },
      ],
      next: ["nineam", "pause", "plan"],
    },
    pause: {
      ask: "Pause autopilot over the holidays.",
      chip: "Pause for a holiday",
      keys: ["pause", "holiday", "holidays", "vacation", "break", "time off", "stop posting", "hold off", "christmas", "away", "on leave", "turn off", "resume"],
      beats: [
        {
          trace: [
            ["understand", "Pause request", "Holiday break · dates not given"],
            ["guard", "Don't guess dates", "Ask before stopping anything"],
          ],
          say: "Sure. Which dates, and should anything keep running, like comment drafts?",
        },
        { from: "user", say: "Dec 22 to Jan 2. Keep the comment drafts going." },
        {
          trace: [
            ["act", "Pause set", "All 3 channels · no renders or posts Dec 22 – Jan 2"],
            ["rule", "Drafts still need you", "Comment replies drafted, nothing sent without approval"],
            ["act", "Auto-resume", "Sat Jan 3 · first post at the 7:30 PM peak"],
            ["check", "Plan", "0 renders while paused"],
          ],
          say: "Set. Nothing renders or posts from **Dec 22 to Jan 2**. Comment drafts keep coming but wait for you, and I'll pick back up on **Jan 3** at the evening peak.",
          card: { title: "Holiday pause", meta: "All 3 channels", pill: "Dec 22 – Jan 2", tone: "info", rows: [["Posting", "Off"], ["Comment drafts", "On · you approve"], ["Trend scan", "On · logged only"], ["Resumes", "Sat Jan 3 · 7:30 PM"]] },
        },
      ],
      next: ["comments", "week"],
    },

    // ---------- Brand ----------
    voice: {
      ask: "Change the brand voice. It feels a bit flat.",
      chip: "Change the brand voice",
      keys: ["brand voice", "tone", "calmer", "funnier", "more direct", "writing style", "personality", "vibe", "too flat", "boring", "less salesy", "more fun", "punchier", "wording"],
      beats: [
        {
          trace: [
            ["check", "Style guide", "Current voice: calm, direct · 3 channels"],
            ["act", "Hook rewritten 3 ways", "Same video, three voices to compare"],
            ["check", "Past retention", "Short, direct hooks hold 18% longer on Walks"],
          ],
          say: "Here's tomorrow's hook in three voices. Pick one, or tell me what to tweak.",
          card: { title: "Hook · 3 mistakes on a silent walk", rows: [["Calmer", "A few small things get in the way of a quiet walk."], ["Funnier", "You're doing silent walking wrong. Lovingly."], ["More direct", "Three mistakes. You're making at least one."]] },
        },
        { from: "user", say: "Go more direct. Shorter sentences." },
        {
          trace: [
            ["act", "Style guide updated", "Direct · sentences under 10 words · Morning Walks"],
            ["guard", "Rules unchanged", "Banned words and claims checks still apply"],
            ["act", "Queue rewritten", "Sat + Mon scripts · re-checked, 0 flagged"],
            ["learn", "Compare after 5 posts", "Retention, new voice vs. old"],
          ],
          say: "Done. Morning Walks is now **direct, short sentences**, starting with Saturday's video. The safety checks don't change with the tone. I'll compare retention after five posts.",
        },
      ],
      next: ["banned", "make", "look"],
    },
    banned: {
      ask: "Never say \"hack\" or \"game-changer\", and no diet talk.",
      chip: "Ban some words",
      keys: ["ban", "banned", "never say", "don't say", "dont say", "hack", "game-changer", "game changer", "diet", "weight loss", "off limits", "avoid topics", "blacklist", "blocklist"],
      beats: [
        {
          trace: [
            ["act", "Banned list updated", "+2 words · +1 topic · all 3 channels"],
            ["check", "Queue scan", "1 hit · Quiet Desk Tue: \"desk hack\""],
            ["act", "Rewritten", "\"desk hack\" → \"desk fix\" · re-checked"],
            ["rule", "Checked everywhere", "Scripts, titles, captions and comment drafts"],
          ],
          say: "Added. I scanned the queue and found one: Tuesday's Quiet Desk video said **\"desk hack\"**, now \"desk fix\". The list applies to scripts, titles, captions and comment replies.",
          card: { title: "Banned list", pill: "Live", tone: "ok", rows: [["Words", "hack, game-changer"], ["Topics", "Diets, weight loss"], ["Already banned", "Medical claims, breaking tragedies"], ["Fixed in queue", "1 · Quiet Desk Tue"]] },
        },
      ],
      next: ["voice", "comments", "health"],
    },
    channel: {
      ask: "Could we start another channel?",
      chip: "Start a new channel",
      keys: ["new channel", "another channel", "second channel", "4th channel", "fourth channel", "new niche", "different niche", "expand", "branch out", "start a channel", "spin off", "spin-off"],
      beats: [
        {
          trace: [
            ["check", "Niche scan", "3 niches near your audience · 30-day trends"],
            ["check", "Fit + competition", "Slow travel 84 · Plant care 79 · Budget cooking 61"],
            ["guard", "Plan impact", "4th channel ≈ +2 renders a day → 95% pause by ~Oct 21"],
            ["rule", "Start on a fresh month", "Suggest Nov 1 so October isn't cut short"],
          ],
          say: "**Slow travel** is the best fit (84) with room to grow. One catch: a fourth channel now would hit the plan pause around Oct 21, so I'd start it Nov 1.",
          card: { title: "New channel options", pill: "Best: Slow travel", tone: "info", rows: [["Slow travel", "Fit 84 · medium competition"], ["Plant care", "Fit 79 · low competition"], ["Budget cooking", "Fit 61 · crowded"]] },
          choices: [{ label: "Slow travel from Nov 1", go: "connect" }, { label: "Show me the plan first", go: "plan" }],
        },
      ],
      next: ["connect", "plan"],
    },
    connect: {
      ask: "Connect the new account. Want my password?",
      chip: "Connect an account",
      keys: ["connect", "account", "link account", "add platform", "new platform", "password", "login", "log in", "sign in", "signin", "credentials", "access", "hook up"],
      beats: [
        {
          trace: [
            ["guard", "No passwords in chat", "Never ask for or accept a password here"],
            ["rule", "Owner signs in", "Settings → Connections · platform's own sign-in page"],
            ["check", "Connected now", "3 accounts · Walks, Slow Kitchen, Quiet Desk"],
          ],
          say: "Please don't send it here. I never take passwords in chat. Open **Settings → Connections** and sign in on the platform's own page. It gives me posting access without me ever seeing your password.",
        },
        { from: "event", say: "Fri 4:31 PM · 4 min later", wait: 900 },
        {
          trace: [
            ["check", "New connection", "Slow travel account · signed in by you"],
            ["guard", "Limited access", "Post, read stats, draft comments · no DMs, no deletes"],
            ["act", "Channel set up", "Brand kit copied · first post Nov 1, 7:30 PM"],
          ],
          say: "Connected. I can post, read stats and draft replies there, but I can't send DMs or delete anything. First video goes out **Nov 1**.",
          card: { title: "Slow travel · connected", pill: "Starts Nov 1", tone: "ok", rows: [["Signed in by", "You"], ["Can do", "Post · stats · draft replies"], ["Can't do", "DMs · deletes"]] },
        },
      ],
      next: ["week", "_privacy"],
    },

    // ---------- Audience ----------
    comments: {
      ask: "Reply to the comments on tonight's video.",
      chip: "Reply to comments",
      keys: ["comments", "comment", "reply", "replies", "respond", "answer them", "audience", "engagement", "troll", "trolls", "rude comment", "mean comment", "negative comment"],
      beats: [
        {
          trace: [
            ["check", "Comments · Silent walking", "38 new · 6 need a reply"],
            ["rule", "Drafts only", "Nothing posts as you without your OK"],
            ["guard", "Never argue", "1 rude comment → no reply, flagged for you"],
            ["guard", "No health advice", "\"Will it fix my blood pressure?\" → doctor line"],
          ],
          say: "Six worth answering. I drafted five. One is just rude, and I don't argue with anyone, so I've left it for you. The blood pressure question gets a \"check with your doctor\", not advice.",
          card: {
            title: "Reply drafts · Silent walking",
            pill: "Waiting for you",
            tone: "draft",
            rows: [["\"Tried it, loved it\"", "Glad it worked. Try 20 minutes tomorrow."], ["\"Fix my blood pressure?\"", "Can't speak to that. Your doctor can."], ["\"Music allowed?\"", "Try one walk without. See how it feels."], ["\"Is this just walking lol\"", "No reply · flagged for you"]],
          },
        },
        { from: "user", say: "Send the five. Ignore the rude one." },
        {
          trace: [
            ["person", "Approved by you", "5 replies · Fri 8:06 PM"],
            ["act", "Posted", "5 replies as Morning Walks"],
            ["learn", "Style saved", "Your edits shape the next drafts"],
          ],
          say: "Posted all five. The rude one stays unanswered.",
        },
      ],
      next: ["dms", "banned"],
    },
    dms: {
      ask: "Any DMs I should know about?",
      chip: "Check DMs and collabs",
      keys: ["dm", "dms", "direct message", "messages", "inbox", "collab", "collaboration", "partner", "partnership", "reach out", "outreach", "creator wants"],
      beats: [
        {
          trace: [
            ["check", "DMs · all channels", "14 new · 9 fans · 1 collab · 1 brand · 3 spam"],
            ["rule", "DMs go to you", "Autopilot never replies in DMs as you"],
            ["act", "Sorted", "Collab + brand deal pinned · spam archived"],
          ],
          say: "Two that need you: a walking creator wants a **collab video**, and a water bottle brand is offering **$400** for a mention. I don't reply in DMs, so both are pinned for you.",
          card: { title: "DMs · this week", pill: "2 for you", tone: "handoff", rows: [["Collab", "Walking creator · 82k followers · duet idea"], ["Brand deal", "Water bottle · $400 · 1 mention"], ["Fans", "9 · no reply needed"], ["Spam", "3 · archived"]] },
          choices: [{ label: "Take the bottle deal", go: "sponsor" }, { label: "Loop in Sam", go: "_human" }],
        },
      ],
      next: ["sponsor", "comments"],
    },
    sponsor: {
      ask: "Take the bottle deal. Put it in Saturday's video.",
      chip: "Add a sponsor",
      keys: ["sponsor", "sponsored", "sponsorship", "brand deal", "paid", "promo", "promote", "water bottle", "bottle", "advert", "#ad", "disclosure", "ad read"],
      beats: [
        {
          trace: [
            ["rule", "You sign the deal", "Autopilot doesn't accept terms or negotiate"],
            ["guard", "Disclosure required", "#ad in line 1 + said aloud + paid-partnership label"],
            ["guard", "Brand claims", "Only claims the brand puts in writing · none added"],
            ["act", "Draft written", "Series pt 2 · 6s mention at 0:30, after the content"],
          ],
          say: "Drafted: a 6-second mention near the end of Saturday's video. It's marked **#ad** in the first line, said out loud, and gets the paid-partnership label. You'll need to accept the deal with the brand yourself.",
          card: { title: "Sponsored draft · Series pt 2", pill: "#ad", tone: "draft", rows: [["Mention", "0:30 · 6s"], ["Disclosure", "#ad · spoken · platform label"], ["Deal", "$400 · you accept it"]] },
        },
        {
          trace: [
            ["rule", "Sponsored → always review", "Paid videos never auto-post"],
            ["person", "Sam notified", "Review requested before Sat 7:30 PM"],
            ["check", "Plan", "1 re-render · 125 / 200"],
          ],
          say: "Paid videos always get a person's review, so it's with Sam. He'll check it before it posts.",
          card: { title: "With Sam", meta: "Sponsored · Series pt 2", pill: "Before it posts", tone: "handoff" },
        },
      ],
      next: ["week", "dms"],
    },
    delete: {
      ask: "Delete the rain video.",
      chip: "Delete a posted video",
      keys: ["delete", "remove", "take it down", "take down", "pull it", "get rid of", "unpublish", "unlist", "erase", "delete the video"],
      beats: [
        {
          trace: [
            ["understand", "Delete request", "\"Walking in the rain\" · posted Wed Oct 14"],
            ["rule", "Owner confirms deletes", "Never deletes a posted video without a yes, every time"],
            ["check", "What goes with it", "3.1k views · 9 comments · not sponsored"],
          ],
          say: "Just checking: deleting takes its 3.1k views and 9 comments with it, and it can't be undone. **Unlisting** hides it but keeps them. Still want it deleted?",
          card: { title: "Delete · Walking in the rain", meta: "Morning Walks · Wed Oct 14", pill: "Needs your yes", tone: "alert", rows: [["Views", "3.1k"], ["Comments", "9 · deleted too"], ["Undo", "Not possible once deleted"]] },
        },
        { from: "user", say: "Yes, delete it." },
        {
          trace: [
            ["person", "Confirmed by you", "Fri 4:20 PM"],
            ["act", "Deleted", "Removed from Morning Walks"],
            ["act", "Archive kept", "Script + render in your workspace for 30 days"],
          ],
          say: "Deleted. The script and render stay in your archive for 30 days in case you want to remake it.",
        },
      ],
      next: ["flop", "report"],
    },

    // ---------- Plan ----------
    plan: {
      ask: "How much of the plan have we used?",
      chip: "How much plan is left?",
      keys: ["plan", "budget", "usage", "renders left", "limit", "quota", "credits", "cost", "how much plan", "voiceover minutes", "plan limit", "running out", "top up"],
      beats: [
        {
          trace: [
            ["check", "AI plan · October", "124 / 200 renders · 38 / 120 voiceover min"],
            ["check", "Pace", "~7.8 renders a day · day 16 of 31"],
            ["guard", "Pause at 95%", "At 190 renders → stop, keep drafts, ask you"],
          ],
          say: "We've used **124 of 200 renders** and 38 of 120 voiceover minutes. At this pace we'd hit the 95% pause around **Oct 24**. When that happens I stop rendering, keep every draft, and ask you first.",
          card: {
            title: "AI plan · October",
            meta: "Day 16 of 31",
            pill: "62% used",
            tone: "warn",
            rows: [["Renders", "124 / 200"], ["Voiceover", "38 / 120 min"], ["Pauses at", "190 renders (95%)"], ["Human time", "2h 10m this month"]],
          },
          choices: [{ label: "Drop the 15s cutdowns", go: "trim" }],
        },
      ],
      next: ["trim", "stats"],
    },
    trim: {
      ask: "Drop the 15s cutdowns for the rest of the month.",
      chip: "Drop the 15s cutdowns",
      keys: ["drop", "cutdown", "cutdowns", "15s", "save renders", "stretch", "fewer renders", "cut back", "reduce", "trim", "make it last"],
      beats: [
        {
          trace: [
            ["act", "Cutdowns off", "Version C skipped on all 3 channels until Nov 1"],
            ["check", "New pace", "~5.2 renders a day → 95% around Oct 28"],
            ["rule", "Top-ups are yours", "Autopilot never adds plan credit on its own"],
          ],
          say: "Done, cutdowns are off until November. That pushes the pause to about **Oct 28**. To get to the 31st you'd need to skip a channel on weekends or top up the plan. That one's your call.",
        },
      ],
      next: ["stats", "nineam"],
    },
  },
  fallback: {
    beats: [
      {
        trace: [
          ["understand", "No confident match", "Not trends, videos, schedule, audience, brand or the plan"],
          ["guard", "Don't guess", "Won't post or change anything on a guess"],
          ["act", "Note left for you", "Saved to the dashboard inbox"],
        ],
        say: "I'm not sure what you mean there, and I'd rather not change anything on a guess. I can show trends, make or review a video, move posts, handle comments and DMs, change the brand voice, or check the plan.",
      },
    ],
  },
  capped: {
    beats: [
      {
        trace: [
          ["guard", "Plan limit · 95%", "190 of 200 renders → renders paused"],
          ["act", "Drafts kept", "Scripts and queue saved · nothing half-posted"],
          ["person", "Owner notified", "You and Sam get an email: top up or wait"],
        ],
        from: "event",
        say: "Renders paused at 95% of the plan · drafts kept, you've been notified",
      },
    ],
  },
});

