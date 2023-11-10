<?php
/**
 * Template Name: REST API Console 3
 *
 * This file is for the WordPress.com deployment of this console.
 */
$dir = get_stylesheet_directory_uri() . '/console3';
show_admin_bar( false );
?>
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width,initial-scale=1">
		<title>WordPress.com Console</title>
		<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Inconsolata:400,700|Open+Sans:300italic,400italic,600italic,400,300,600">
		<link href="<?php echo $dir; ?>/static/{CSS_FILENAME}" rel="stylesheet">
	</head>
	<body>
		<div id="root"></div>
	</body>
	<script type="text/javascript" src="<?php echo $dir; ?>/static/{JS_FILENAME}"></script>
</html>
